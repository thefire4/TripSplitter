from flask import Blueprint, request, jsonify
from db import get_db

landing_page_bp = Blueprint('landing_page', __name__)
@landing_page_bp.route('/<int:client_id>', methods=['GET'])
def landing(client_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('''SELECT 
                   tm.tripid, t.tripName 
                   FROM tripmembers tm 
                   JOIN trip t ON tm.tripid = t.tripid
                   WHERE tm.clientid = %s''', (client_id,))
    user = cursor.fetchall()
    
    cursor.close()
    db.close()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'message': 'Landing page data', 'user': user}), 200
