import hashlib


def proof_of_work(last_proof):
    print("Searching for next proof")
    proof = 10000000
    while not valid_proof(last_proof, proof):
        proof += 1
    return proof


def valid_proof(last_proof, proof):
    proof_hash = hashlib.sha256(f"{last_proof}{proof}".encode()).hexdigest()
    return proof_hash[:6] == '000000'


print(proof_of_work(10111946))
