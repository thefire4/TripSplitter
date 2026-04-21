from flask import Blueprint, request, jsonify
from db import get_db

addexpense_bp = Blueprint('add_expense', __name__)
@addexpense_bp.route('/<int:client_id>/<int:trip_id>/addexpense', methods=['POST'])
def add_expense(client_id, trip_id):
    data = request.get_json()
    expenseName = data.get('expenseName')
    amount = data.get('amount')
    description = data.get('description')
    members = data.get('members', [])

    if not amount or not description or not expenseName:
        return jsonify({'error': 'Amount, Description, and Expense Name are required'}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("INSERT INTO expenses (tripid, expenseName, expensePrice, description, paidBy) VALUES (%s, %s, %s, %s, %s)", (trip_id, expenseName, amount, description, client_id))
    db.commit()

    new_expense_id = cursor.lastrowid
    for member_id in members:
        cursor.execute("INSERT INTO expenseparticipants (expenseid, clientid) VALUES (%s, %s)", (new_expense_id, member_id))
    db.commit()
    
    cursor.close()
    db.close()

    return jsonify({'message': 'Expense added successfully', 'expense_id': new_expense_id}), 201