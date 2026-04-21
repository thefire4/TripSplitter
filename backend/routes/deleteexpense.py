from flask import Blueprint, request, jsonify
from db import get_db

deleteexpense_bp = Blueprint('deleteexpense', __name__)
@deleteexpense_bp.route('/<int:client_id>/<int:expense_id>', methods=['DELETE'])
def delete_expense(client_id, expense_id):
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
        return jsonify({'error': 'Unauthorized to delete this expense'}), 403
    
    cursor.execute("DELETE FROM expenseparticipants WHERE expenseid = %s", (expense_id,))
    cursor.execute("DELETE FROM expenses WHERE expenseid = %s", (expense_id,))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({'message': 'Expense deleted successfully'}), 200