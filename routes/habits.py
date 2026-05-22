from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user
from models import db, Habit, HabitLog
from datetime import date
from sqlalchemy.exc import IntegrityError

habits_bp = Blueprint('habits', __name__)


@habits_bp.route('/habits')
@login_required
def index():
    habits = Habit.query.filter_by(user_id=current_user.id).order_by(Habit.created_at.desc()).all()
    return render_template('habits/index.html', habits=habits, today=date.today())


@habits_bp.route('/habits/create', methods=['POST'])
@login_required
def create():
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()

    if not title:
        flash('Название привычки обязательно', 'error')
        return redirect(url_for('habits.index'))

    habit = Habit(user_id=current_user.id, title=title, description=description)
    db.session.add(habit)
    db.session.commit()
    return redirect(url_for('habits.index'))


@habits_bp.route('/habits/<int:habit_id>/check', methods=['POST'])
@login_required
def check(habit_id):
    habit = Habit.query.filter_by(id=habit_id, user_id=current_user.id).first_or_404()
    existing = HabitLog.query.filter_by(habit_id=habit_id, date=date.today()).first()
    if existing:
        db.session.delete(existing)
    else:
        log = HabitLog(habit_id=habit_id, date=date.today())
        db.session.add(log)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
    return redirect(request.referrer or url_for('habits.index'))


@habits_bp.route('/habits/<int:habit_id>/delete', methods=['POST'])
@login_required
def delete(habit_id):
    habit = Habit.query.filter_by(id=habit_id, user_id=current_user.id).first_or_404()
    db.session.delete(habit)
    db.session.commit()
    return redirect(url_for('habits.index'))
