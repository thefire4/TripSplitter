from flask import Blueprint, request, jsonify
from db import get_db

editexpenses_bp = Blueprint('edit_expenses', __name__)
@editexpenses_bp.route('/<int:client_id>/editexpenses/<int:trip_id>/<int:expense_id>', methods=['GET', 'PUT'])
def edit_expenses(client_id, trip_id, expense_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT paidBy FROM expenses WHERE expenseid = %s", (expense_id,))
    paidBy = cursor.fetchone()
    if not paidBy:
        cursor.close()
        db.close()
        return jsonify({'error': 'Expense not found'}), 404
    
    if paidBy['paidBy'] != client_id:
        cursor.close()
        db.close()
        return jsonify({'error': 'Unauthorized to edit this expense'}), 403
    
    if request.method == 'PUT':
        data = request.get_json()
        expenseName = data.get('expenseName')
        expensePrice = data.get('expensePrice')
        expenseMembers = data.get('members', [])
        
        if expenseName:
            cursor.execute("UPDATE expenses SET expenseName = %s WHERE expenseid = %s", (expenseName, expense_id))
        if expensePrice:
            cursor.execute("UPDATE expenses SET expensePrice = %s WHERE expenseid = %s", (expensePrice, expense_id))
        if expenseMembers:
            cursor.execute("DELETE FROM expenseparticipants WHERE expenseid = %s", (expense_id,))
            for member in expenseMembers:
                cursor.execute("INSERT INTO expenseparticipants (expenseid, clientid) VALUES (%s, %s)", (expense_id, member))
        db.commit()

    cursor.execute("SELECT * FROM expenses WHERE expenseid = %s", (expense_id,))
    expense = cursor.fetchone()

    cursor.close()
    db.close()

    if not expense:
        return jsonify({'error': 'Expense not found'}), 404
    
    return jsonify({'message': 'Edit expenses data', 'expense': expense}), 200