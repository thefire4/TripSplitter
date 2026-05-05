from flask import Blueprint, jsonify
from db import get_db

clients_bp = Blueprint('clients', __name__)

@clients_bp.route('/clients', methods=['GET'])
def get_clients():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('''
        SELECT
          clientid,
          firstName,
          lastName,
          email,
          CONCAT(firstName, ' ', lastName) AS name
        FROM client
        ORDER BY firstName, lastName
    ''')
    clients = cursor.fetchall()
    cursor.close()
    db.close()

    return jsonify({'message': 'Clients data', 'clients': clients}), 200
