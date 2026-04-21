from flask import Blueprint, request, jsonify
from db import get_db

deletetrip_bp = Blueprint('deletetrip', __name__)
@deletetrip_bp.route('/<int:client_id>/<int:trip_id>', methods=['DELETE'])
def delete_trip(client_id, trip_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("Select created_by from trip where tripid = %s", (trip_id,))
    created_by = cursor.fetchone()
    if not created_by:
        cursor.close()
        db.close()
        return jsonify({'error': 'Trip not found'}), 404

    if created_by['created_by'] != client_id:
        cursor.close()
        db.close()
        return jsonify({'error': 'Unauthorized to delete this trip'}), 403
    
    cursor.execute("DELETE FROM expenseparticipants WHERE expenseid IN (SELECT expenseid FROM expenses WHERE tripid = %s)", (trip_id,))
    cursor.execute("DELETE FROM expenses WHERE tripid = %s", (trip_id,))
    cursor.execute("DELETE FROM tripmembers WHERE tripid = %s", (trip_id,))
    cursor.execute("DELETE FROM trip WHERE tripid = %s", (trip_id,))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({'message': 'Trip deleted successfully'}), 200