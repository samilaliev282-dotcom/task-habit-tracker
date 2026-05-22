from flask import Blueprint, render_template, redirect, url_for, request, jsonify
from flask_login import login_required, current_user
from models import db, Note
from datetime import datetime

notes_bp = Blueprint('notes', __name__)

COLORS = ['default', 'red', 'amber', 'emerald', 'cyan', 'indigo']


@notes_bp.route('/notes')
@login_required
def index():
    notes = Note.query.filter_by(user_id=current_user.id).order_by(Note.updated_at.desc()).all()
    return render_template('notes/index.html', notes=notes, colors=COLORS)


@notes_bp.route('/notes/create', methods=['POST'])
@login_required
def create():
    note = Note(user_id=current_user.id, title='Новая заметка', content='')
    db.session.add(note)
    db.session.commit()
    return redirect(url_for('notes.edit', note_id=note.id))


@notes_bp.route('/notes/<int:note_id>/edit', methods=['GET', 'POST'])
@login_required
def edit(note_id):
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first_or_404()
    if request.method == 'POST':
        note.title = request.form.get('title', '').strip() or 'Без названия'
        note.content = request.form.get('content', '')
        note.color = request.form.get('color', 'default')
        note.updated_at = datetime.utcnow()
        db.session.commit()
        return redirect(url_for('notes.index'))
    return render_template('notes/edit.html', note=note, colors=COLORS)


@notes_bp.route('/notes/<int:note_id>/delete', methods=['POST'])
@login_required
def delete(note_id):
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first_or_404()
    db.session.delete(note)
    db.session.commit()
    return redirect(url_for('notes.index'))
