from flask import Blueprint, render_template
from flask_login import login_required, current_user
from models import Task, Habit
from datetime import date

dashboard = Blueprint('dashboard', __name__)


@dashboard.route('/')
@login_required
def index():
    tasks = Task.query.filter_by(user_id=current_user.id).order_by(Task.deadline.asc().nullslast(), Task.created_at.desc()).all()
    habits = Habit.query.filter_by(user_id=current_user.id).all()

    active_tasks = [t for t in tasks if not t.completed]
    done_tasks = [t for t in tasks if t.completed]
    overdue = [t for t in active_tasks if t.is_overdue]

    best_streak = max((h.streak for h in habits), default=0)
    habits_done_today = sum(1 for h in habits if h.done_today)

    return render_template('dashboard.html',
        tasks=tasks,
        habits=habits,
        active_count=len(active_tasks),
        done_count=len(done_tasks),
        overdue_count=len(overdue),
        best_streak=best_streak,
        habits_done_today=habits_done_today,
        today=date.today()
    )
