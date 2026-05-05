from flask import Blueprint, request, jsonify
from db import get_db

tripexpenses_bp = Blueprint('trip_expenses', __name__)
@tripexpenses_bp.route('/<int:client_id>/<int:trip_id>', methods=['GET'])
def get_trip_expenses(client_id, trip_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute('''
        SELECT
          c.clientid,
          c.firstName,
          c.lastName,
          c.email,
          CONCAT(c.firstName, ' ', c.lastName) AS name
        FROM tripmembers tm
        JOIN client c ON tm.clientid = c.clientid
        WHERE tm.tripid = %s
        ORDER BY c.firstName, c.lastName
    ''', (trip_id,))
    members = cursor.fetchall()

    if not any(member['clientid'] == client_id for member in members):
        cursor.close()
        db.close()
        return jsonify({'error': 'Trip not found'}), 404

    cursor.execute('''SELECT DISTINCT
                   e.expenseid,
                   e.expenseName,
                   e.expensePrice,
                   e.paidBy,
                   CONCAT(c.firstName, ' ', c.lastName) AS paidByName
                   FROM expenses e
                   JOIN tripmembers tm ON e.tripid = tm.tripid
                   JOIN client c ON e.paidBy = c.clientid
                   WHERE tm.clientid = %s AND e.tripid = %s''', (client_id, trip_id))
    expenses = cursor.fetchall()
    
    cursor.close()
    db.close()

    return jsonify({
        'message': 'Trip expenses data',
        'expenses': expenses,
        'members': members
    }), 200
