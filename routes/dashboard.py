from flask import Blueprint, render_template
from flask_login import login_required, current_user
from models import Task, Habit, HabitLog
from datetime import date, timedelta
import json

dashboard = Blueprint('dashboard', __name__)


@dashboard.route('/')
@login_required
def index():
    tasks = Task.query.filter_by(user_id=current_user.id).order_by(Task.deadline.asc().nullslast(), Task.created_at.desc()).all()
    habits = Habit.query.filter_by(user_id=current_user.id).all()

    active_tasks = [t for t in tasks if not t.completed]
    done_tasks   = [t for t in tasks if t.completed]
    overdue      = [t for t in active_tasks if t.is_overdue]

    best_streak       = max((h.streak for h in habits), default=0)
    habits_done_today = sum(1 for h in habits if h.done_today)

    # Chart: задачи выполненные по неделям (последние 8 недель)
    weeks_labels = []
    weeks_data   = []
    for i in range(7, -1, -1):
        week_start = date.today() - timedelta(weeks=i, days=date.today().weekday())
        week_end   = week_start + timedelta(days=6)
        count = sum(1 for t in done_tasks
                    if t.completed_at and week_start <= t.completed_at.date() <= week_end)
        weeks_labels.append(week_start.strftime('%d.%m'))
        weeks_data.append(count)

    # Heatmap: последние 12 недель активности привычек
    heatmap = []
    for i in range(83, -1, -1):
        d = date.today() - timedelta(days=i)
        count = HabitLog.query.join(Habit).filter(
            Habit.user_id == current_user.id,
            HabitLog.date == d
        ).count()
        heatmap.append({'date': d.isoformat(), 'count': count})

    return render_template('dashboard.html',
        tasks=tasks, habits=habits,
        active_count=len(active_tasks),
        done_count=len(done_tasks),
        overdue_count=len(overdue),
        best_streak=best_streak,
        habits_done_today=habits_done_today,
        today=date.today(),
        weeks_labels=json.dumps(weeks_labels),
        weeks_data=json.dumps(weeks_data),
        heatmap=heatmap,
        total_habits=len(habits),
    )
