from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, date

db = SQLAlchemy()


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    tasks = db.relationship('Task', backref='user', lazy=True, cascade='all, delete-orphan')
    habits = db.relationship('Habit', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    deadline = db.Column(db.Date, nullable=True)
    priority = db.Column(db.String(10), default='medium')  # high / medium / low
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def is_overdue(self):
        return self.deadline and not self.completed and self.deadline < date.today()


class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    logs = db.relationship('HabitLog', backref='habit', lazy=True, cascade='all, delete-orphan')

    @property
    def done_today(self):
        return HabitLog.query.filter_by(habit_id=self.id, date=date.today()).first() is not None

    @property
    def streak(self):
        from datetime import timedelta
        log_set = {l.date for l in self.logs}
        if not log_set:
            return 0
        streak = 0
        check = date.today()
        while check in log_set:
            streak += 1
            check -= timedelta(days=1)
        return streak

    def last_7_days(self):
        from datetime import timedelta
        log_set = {l.date for l in self.logs}
        return [(date.today() - timedelta(days=6 - i), (date.today() - timedelta(days=6 - i)) in log_set) for i in range(7)]


class HabitLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    habit_id = db.Column(db.Integer, db.ForeignKey('habit.id'), nullable=False)
    date = db.Column(db.Date, default=date.today, nullable=False)

    __table_args__ = (db.UniqueConstraint('habit_id', 'date'),)
