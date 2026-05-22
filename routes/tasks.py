from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user
from models import db, Task
from datetime import date

tasks_bp = Blueprint('tasks', __name__)


@tasks_bp.route('/tasks')
@login_required
def index():
    filter_by = request.args.get('filter', 'all')
    query = Task.query.filter_by(user_id=current_user.id)

    if filter_by == 'active':
        query = query.filter_by(completed=False)
    elif filter_by == 'done':
        query = query.filter_by(completed=True)

    tasks = query.order_by(Task.deadline.asc().nullslast(), Task.created_at.desc()).all()
    return render_template('tasks/index.html', tasks=tasks, filter=filter_by, today=date.today())


@tasks_bp.route('/tasks/create', methods=['POST'])
@login_required
def create():
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    deadline_str = request.form.get('deadline', '')

    if not title:
        flash('Название задачи обязательно', 'error')
        return redirect(url_for('tasks.index'))

    deadline = None
    if deadline_str:
        try:
            deadline = date.fromisoformat(deadline_str)
        except ValueError:
            pass

    priority = request.form.get('priority', 'medium')
    if priority not in ('high', 'medium', 'low'):
        priority = 'medium'
    task = Task(user_id=current_user.id, title=title, description=description, deadline=deadline, priority=priority)
    db.session.add(task)
    db.session.commit()
    return redirect(url_for('tasks.index'))


@tasks_bp.route('/tasks/<int:task_id>/toggle', methods=['POST'])
@login_required
def toggle(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    task.completed = not task.completed
    db.session.commit()
    return redirect(request.referrer or url_for('tasks.index'))


@tasks_bp.route('/tasks/<int:task_id>/delete', methods=['POST'])
@login_required
def delete(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    db.session.delete(task)
    db.session.commit()
    return redirect(request.referrer or url_for('tasks.index'))
