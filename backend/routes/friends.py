from flask import Blueprint, request, jsonify
from db import get_db

friends_bp = Blueprint('friends', __name__)

@friends_bp.route('/<int:client_id>/friends', methods=['GET'])
def get_friends(client_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('''
        SELECT
          c.clientid,
          c.firstName,
          c.lastName,
          c.email,
          CONCAT(c.firstName, ' ', c.lastName) AS name
        FROM friends f
        JOIN client c ON f.friendid = c.clientid
        WHERE f.clientid = %s
        ORDER BY c.firstName, c.lastName
    ''', (client_id,))
    friends = cursor.fetchall()
    cursor.close()
    db.close()

    return jsonify({'message': 'Friends data', 'friends': friends}), 200

@friends_bp.route('/<int:client_id>/friends', methods=['POST'])
def add_friend(client_id):
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Friend email is required'}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT clientid FROM client WHERE clientid = %s", (client_id,))
    owner = cursor.fetchone()

    if not owner:
        cursor.close()
        db.close()
        return jsonify({'error': 'Client not found'}), 404

    cursor.execute('''
        SELECT
          clientid,
          firstName,
          lastName,
          email,
          CONCAT(firstName, ' ', lastName) AS name
        FROM client
        WHERE email = %s
    ''', (email,))
    friend = cursor.fetchone()

    if not friend:
        cursor.close()
        db.close()
        return jsonify({'error': 'No user found with that email'}), 404

    if friend['clientid'] == client_id:
        cursor.close()
        db.close()
        return jsonify({'error': 'You cannot add yourself as a friend'}), 400

    cursor.execute('''
        INSERT IGNORE INTO friends (clientid, friendid)
        VALUES (%s, %s)
    ''', (client_id, friend['clientid']))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({'message': 'Friend added', 'friend': friend}), 201
