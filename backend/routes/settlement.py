from flask import Blueprint, request, jsonify
from db import get_db

settlement_bp = Blueprint('settlement', __name__)
@settlement_bp.route('/<int:trip_id>', methods=['GET'])
def settle_expenses(trip_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute(''' SELECT * from expenses where tripid = %s''', (trip_id,))
    expenses = cursor.fetchall()

    balances = {}

    for expense in expenses:
        cursor.execute('''SELECT * from expenseparticipants where expenseid = %s''', (expense['expenseid'],))
        participants = cursor.fetchall()
        
        split_amount = expense['expensePrice'] / len(participants)
        
        balances[expense['paidBy']] = balances.get(expense['paidBy'], 0) + expense['expensePrice']
        for participant in participants:
            balances[participant['clientid']] = balances.get(participant['clientid'], 0) - split_amount

    creditors = []
    debtors = []
    for key in balances:
        if balances[key] > 0:
            creditors.append({'clientid': key, 'amount': balances[key]})
        elif balances[key] < 0:
            debtors.append({'clientid': key, 'amount': -balances[key]}) 
    
    #sorting algor
    creditors.sort(key=lambda x: x['amount'], reverse=True)
    debtors.sort(key=lambda x: x['amount'], reverse=True)

    transactions = []

    while creditors and debtors:
        creditor = creditors[0]
        debtor = debtors[0]

        amount_to_settle = min(creditor['amount'], debtor['amount'])
        
        transactions.append({'from': debtor['clientid'], 'to': creditor['clientid'], 'amount': round(amount_to_settle,2)})

        creditor['amount'] -= amount_to_settle
        debtor['amount'] -= amount_to_settle

        if creditor['amount'] == 0:
            creditors.pop(0)
        if debtor['amount'] == 0:
            debtors.pop(0)
    cursor.close()
    db.close()
    return jsonify({'message': 'Settlement transactions', 'transactions': transactions}), 200