from flask import Blueprint, request, jsonify
from db import get_db

tripexpenses_bp = Blueprint('trip_expenses', __name__)
@tripexpenses_bp.route('/<int:client_id>/<int:trip_id>', methods=['GET'])
def get_trip_expenses(client_id, trip_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('''SELECT DISTINCT
                   e.expenseid, e.expenseName, e.expensePrice, e.paidBy
                   FROM expenses e
                   JOIN tripmembers tm ON e.tripid = tm.tripid
                   WHERE tm.clientid = %s AND e.tripid = %s''', (client_id, trip_id))
    expenses = cursor.fetchall()
    
    cursor.close()
    db.close()

    if not expenses:
        return jsonify({'error': 'No expenses found for this trip'}), 404

    return jsonify({'message': 'Trip expenses data', 'expenses': expenses}), 200