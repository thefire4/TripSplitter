from flask import Blueprint, request, jsonify
from db import get_db

createtrip_bp = Blueprint('create_trip', __name__)
@createtrip_bp.route('/createtrip', methods=['POST'])
def create_trip():
    data = request.get_json()
    tripName = data.get('tripName')
    clientId = data.get('clientId')
    members = data.get('members', [])

    if not tripName or not clientId:
        return jsonify({'error': 'Trip Name and Client ID are required'}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("INSERT INTO trip (tripName,created_by) VALUES (%s, %s)", (tripName, clientId))
    db.commit()
    
    new_trip_id = cursor.lastrowid
    cursor.execute("INSERT INTO tripmembers (tripid, clientid) VALUES (%s, %s)", (new_trip_id, clientId))
    db.commit()

    for member_id in members:
        if member_id != clientId:  # Avoid adding the creator twice
            cursor.execute("INSERT INTO tripmembers (tripid, clientid) VALUES (%s, %s)", (new_trip_id, member_id))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({'message': 'Trip created successfully', 'trip_id': new_trip_id}), 201