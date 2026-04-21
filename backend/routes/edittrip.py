from flask import Blueprint, request, jsonify
from db import get_db

edittrip_bp = Blueprint('edit_trip', __name__)
@edittrip_bp.route('/<int:client_id>/edittrip/<int:trip_id>', methods=['GET', 'PUT'])
def edit_trip(client_id, trip_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("Select created_by from trip where tripid = %s", (trip_id,))
    created_by = cursor.fetchone()
    if not created_by:
        return jsonify({'error': 'Trip not found'}), 404
    
    if created_by['created_by'] != client_id:
        cursor.close()
        db.close()
        return jsonify({'error': 'Unauthorized to edit this trip'}), 403
    
    if request.method == 'PUT':
        data = request.get_json()
        tripName = data.get('tripName')
        tripmembers = data.get('members', [])
        if tripName:
            cursor.execute("UPDATE trip SET tripName = %s WHERE tripid = %s", (tripName, trip_id))
            db.commit()
        if tripmembers:   
            cursor.execute("DELETE FROM tripmembers WHERE tripid = %s", (trip_id,))
            cursor.execute("INSERT INTO tripmembers (tripid, clientid) VALUES (%s, %s)", (trip_id, client_id))
            for member in tripmembers:
                if member != client_id:
                    cursor.execute("INSERT INTO tripmembers (tripid, clientid) VALUES (%s, %s)", (trip_id, member))
            db.commit()

    cursor.execute("SELECT * FROM trip WHERE tripid = %s", (trip_id,))
    trip = cursor.fetchone()

    cursor.close()
    db.close()

    if not trip:
        return jsonify({'error': 'Trip not found'}), 404
    
    return jsonify({'message': 'Edit trip data', 'trip': trip}), 200