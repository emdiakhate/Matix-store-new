# 📸 Informations Bictorys Nécessaires

Puisque vous ne pouvez pas coller les captures d'écran ici, voici ce dont j'ai besoin de la documentation Bictorys :

## Option 1 : Copier-Coller le Texte

Allez sur https://docs.bictorys.com/reference/getting-started et copiez-collez ici :

### 1. Créer un Paiement (Create Payment)

```
Endpoint : POST /pay/v1/???
Headers : ???
Body : {
  ???
}
Response : {
  ???
}
```

### 2. Vérifier une Transaction (Get Transaction)

```
Endpoint : GET /pay/v1/???
Headers : ???
Response : {
  ???
}
```

### 3. Webhooks

```
URL à configurer : ???
Événements disponibles : ???
Payload reçu : {
  ???
}
```

## Option 2 : Répondre à Ces Questions

1. **Endpoint pour créer un paiement** :
   - URL complète : `https://api.test.bictorys.com/pay/v1/...` (compléter)

2. **Champs requis pour créer un paiement** :
   - [ ] amount
   - [ ] currency
   - [ ] customer (email, phone, name)
   - [ ] reference
   - [ ] description
   - [ ] return_url
   - [ ] cancel_url
   - [ ] Autres ? Lesquels ?

3. **Réponse après création** :
   - Quel champ contient l'URL de paiement ? `payment_url` ou `checkout_url` ?
   - Quel champ contient l'ID de transaction ? `transaction_id` ou `id` ?

4. **Statuts possibles** :
   - [ ] pending
   - [ ] success
   - [ ] failed
   - [ ] cancelled
   - [ ] Autres ?

5. **Headers requis** :
   - Authorization : `Bearer {api_key}` ?
   - Content-Type : `application/json` ?
   - Autres headers ?

## Option 3 : Upload d'Image

1. Allez sur https://imgur.com/upload
2. Uploadez votre capture d'écran
3. Copiez le lien et envoyez-le moi

## Option 4 : Description Textuelle

Décrivez simplement ce que vous voyez dans la documentation :

- Comment on crée un paiement
- Quels champs sont obligatoires
- Comment fonctionne la redirection
- etc.

---

**Pour l'instant, j'ai configuré avec ces valeurs par défaut :**

- Endpoint : `POST https://api.test.bictorys.com/pay/v1/payments`
- Headers : `Authorization: Bearer {secret_key}`, `Content-Type: application/json`
- Body : `{ amount, currency: 'XOF', customer: {email, phone, name}, reference, description, return_url, cancel_url }`

**Dites-moi si c'est correct ou s'il y a des différences !**
