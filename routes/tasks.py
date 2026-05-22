from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user
from models import db, Task
from datetime import date, datetime

tasks_bp = Blueprint('tasks', __name__)

ALL_TAGS = ['работа', 'учёба', 'личное', 'здоровье', 'финансы', 'покупки']


@tasks_bp.route('/tasks')
@login_required
def index():
    filter_by = request.args.get('filter', 'all')
    tag_filter = request.args.get('tag', '')
    query = Task.query.filter_by(user_id=current_user.id)

    if filter_by == 'active':
        query = query.filter_by(completed=False)
    elif filter_by == 'done':
        query = query.filter_by(completed=True)

    tasks = query.order_by(Task.deadline.asc().nullslast(), Task.created_at.desc()).all()

    if tag_filter:
        tasks = [t for t in tasks if tag_filter in t.tags]

    return render_template('tasks/index.html', tasks=tasks, filter=filter_by,
                           today=date.today(), all_tags=ALL_TAGS, tag_filter=tag_filter)


@tasks_bp.route('/tasks/create', methods=['POST'])
@login_required
def create():
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    deadline_str = request.form.get('deadline', '')
    priority = request.form.get('priority', 'medium')
    recurring = request.form.get('recurring', 'none')
    tags = request.form.getlist('tags')

    if not title:
        flash('Название задачи обязательно', 'error')
        return redirect(url_for('tasks.index'))

    deadline = None
    if deadline_str:
        try:
            deadline = date.fromisoformat(deadline_str)
        except ValueError:
            pass

    if priority not in ('high', 'medium', 'low'):
        priority = 'medium'
    if recurring not in ('none', 'daily', 'weekly'):
        recurring = 'none'

    task = Task(user_id=current_user.id, title=title, description=description,
                deadline=deadline, priority=priority, recurring=recurring)
    task.tags = [t for t in tags if t in ALL_TAGS]
    db.session.add(task)
    db.session.commit()
    return redirect(url_for('tasks.index'))


@tasks_bp.route('/tasks/<int:task_id>/toggle', methods=['POST'])
@login_required
def toggle(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    task.completed = not task.completed
    task.completed_at = datetime.utcnow() if task.completed else None

    # Если задача повторяющаяся — создаём новую
    if task.completed and task.recurring != 'none':
        from datetime import timedelta
        new_deadline = None
        if task.deadline:
            delta = timedelta(days=1) if task.recurring == 'daily' else timedelta(weeks=1)
            new_deadline = task.deadline + delta
        new_task = Task(
            user_id=task.user_id, title=task.title,
            description=task.description, deadline=new_deadline,
            priority=task.priority, recurring=task.recurring
        )
        new_task.tags = task.tags
        db.session.add(new_task)

    db.session.commit()
    return redirect(request.referrer or url_for('tasks.index'))


@tasks_bp.route('/tasks/<int:task_id>/delete', methods=['POST'])
@login_required
def delete(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    db.session.delete(task)
    db.session.commit()
    return redirect(request.referrer or url_for('tasks.index'))
