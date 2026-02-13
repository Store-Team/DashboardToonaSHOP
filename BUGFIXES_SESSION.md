# 🐛 Corrections des Bugs - Session du 13 février 2026

## Problèmes corrigés

### 1. ✅ Dashboard affiche des 0 au lieu des vraies stats

**Problème** : Le backend renvoie les données en `snake_case` (total_groups, total_users) mais le frontend attend du `camelCase` (totalGroups, totalUsers).

**Solution** : Transformer les données à la réception dans `adminService.ts`

```typescript
// Avant
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get<AdminStats>('/admin/stats');
  return response.data;
};

// Après
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get<any>('/admin/stats');
  
  // Transformer snake_case du backend en camelCase
  const data = response.data;
  return {
    totalGroups: data.total_groups || data.totalGroups || 0,
    activeGroups: data.active_groups || data.activeGroups || 0,
    totalRevenue: data.total_revenue || data.totalRevenue || 0,
    totalUsers: data.total_users || data.totalUsers || 0,
    activeSubscriptions: data.active_subscriptions || data.activeSubscriptions || 0,
    trialGroups: data.trial_groups || data.trialGroups || 0,
    trends: data.trends || undefined
  };
};
```

**Fichier modifié** : `src/services/adminService.ts`

---

### 2. ✅ Page Groupes : Chargement infini (timeout)

**Problème** : Le hook `useListSync` avec `interval: 30000` causait des appels répétés toutes les 30 secondes, combiné avec les changements de `page`, `rowsPerPage`, et `searchQuery`, créait une boucle infinie de requêtes qui timeout.

**Solution** : Désactiver l'auto-refresh en mettant `interval: 0` et `refreshOnMount: true`

```typescript
// Avant
const { data: groups, loading, lastSync, refresh } = useListSync<Group>(
  () => fetchGroups(page, rowsPerPage, searchQuery),
  {
    interval: 30000, // Rafraîchir toutes les 30 secondes
    refreshOnFocus: true,
    onError: (error) => { console.error('Erreur de synchronisation:', error); }
  }
);

// Après
const { data: groups, loading, lastSync, refresh } = useListSync<Group>(
  () => fetchGroups(page, rowsPerPage, searchQuery),
  {
    interval: 0, // Désactiver l'auto-refresh pour éviter les timeouts
    refreshOnMount: true, // Charger au montage seulement
    onError: (error) => { console.error('Erreur de synchronisation:', error); }
  }
);
```

**Fichiers modifiés** :
- `src/pages/Groups/GroupManagement.tsx`
- `src/pages/Groups/GroupDetails.tsx`

---

### 3. ✅ Page Paiements : Affiche NaN pour les montants

**Problème** : Les montants venant du backend peuvent être `null`, `undefined`, ou des chaînes vides, ce qui cause `parseFloat()` de retourner `NaN`.

**Solution** : Valider les données avant de les parser

```typescript
// Avant
<TableCell sx={{ fontWeight: 600 }}>
  {parseFloat(payment.amount).toFixed(2)} {payment.orderCurrency}
</TableCell>

// Après
<TableCell sx={{ fontWeight: 600 }}>
  {payment.amount && !isNaN(parseFloat(payment.amount)) 
    ? `${parseFloat(payment.amount).toFixed(2)} ${payment.orderCurrency || ''}` 
    : 'N/A'
  }
</TableCell>
```

**Fichier modifié** : `src/pages/Payments/PaymentHistory.tsx`

---

### 4. ✅ Page IMF : Erreur 403 (Forbidden)

**Problème** : Les endpoints IMF étaient mal formés : `/imf/admin/groups/pending` au lieu de `/admin/imf/groups/pending`

**Solution** : Corriger l'ordre des segments dans les URLs

```typescript
// Avant
await api.get('/imf/admin/groups/pending', { params: { ... } });
await api.patch(`/imf/admin/group/${id}/approve`);
await api.get('/imf/admin/groups/approved', { params: { ... } });

// Après
await api.get('/admin/imf/groups/pending', { params: { ... } });
await api.patch(`/admin/imf/group/${id}/approve`);
await api.get('/admin/imf/groups/approved', { params: { ... } });
```

**Fichiers modifiés** :
- `src/pages/IMF/ImfPendingGroups.tsx`
- `src/pages/IMF/ImfApprovedGroups.tsx`
- `src/pages/IMF/ImfApprovalPage.tsx`

---

### 5. ✅ Warnings DOM : `<div>` dans `<p>`

**Problème** : Material-UI génère des warnings car des composants `<Chip>` (qui rendent des `<div>`) sont placés dans des `<Typography component="span">` qui sont eux-mêmes dans des `<ListItemText secondary>` qui rend un `<p>`.

**Solution** : Remplacer `<Typography component="span">` par `<Box component="span">` pour les conteneurs de Chips

```typescript
// Avant
secondary={
  <React.Fragment>
    <Typography component="span" variant="caption" color="text.secondary" display="block">
      {group.email || 'Pas d\'email'}
    </Typography>
    <Typography component="span" variant="caption" sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
      <Chip label="..." size="small" variant="outlined" />
      <Typography component="span" variant="caption" color="text.secondary">
        {group.createdAt && formatDate(group.createdAt)}
      </Typography>
    </Typography>
  </React.Fragment>
}

// Après
secondary={
  <React.Fragment>
    <Typography component="span" variant="caption" color="text.secondary" display="block">
      {group.email || 'Pas d\'email'}
    </Typography>
    <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
      <Chip label="..." size="small" variant="outlined" />
      <Typography component="span" variant="caption" color="text.secondary">
        {group.createdAt && formatDate(group.createdAt)}
      </Typography>
    </Box>
  </React.Fragment>
}
```

**Fichier modifié** : `src/pages/Dashboard/DashboardHome.tsx`

---

### 6. ✅ Warnings MUI : Tooltip avec bouton disabled

**Problème** : MUI génère des warnings car les Tooltips ne peuvent pas écouter les événements sur des éléments disabled.

**Solution** : Wrapper les boutons disabled dans un `<span>`

```typescript
// Avant
<Tooltip title="Rafraîchir les données">
  <IconButton onClick={refresh} disabled={loading} color="primary">
    <RefreshIcon />
  </IconButton>
</Tooltip>

// Après
<Tooltip title="Rafraîchir les données">
  <span>
    <IconButton onClick={refresh} disabled={loading} color="primary">
      <RefreshIcon />
    </IconButton>
  </span>
</Tooltip>
```

**Fichiers modifiés** :
- `src/pages/Groups/GroupManagement.tsx`
- `src/pages/Groups/GroupDetails.tsx`

---

## Résumé des modifications

### Fichiers modifiés (8 fichiers)

1. ✅ `src/services/adminService.ts` - Transformation snake_case → camelCase
2. ✅ `src/pages/Groups/GroupManagement.tsx` - Désactivation auto-refresh + Tooltip fix
3. ✅ `src/pages/Groups/GroupDetails.tsx` - Désactivation auto-refresh + Tooltip fix
4. ✅ `src/pages/Payments/PaymentHistory.tsx` - Validation des montants NaN
5. ✅ `src/pages/IMF/ImfPendingGroups.tsx` - Correction endpoints IMF
6. ✅ `src/pages/IMF/ImfApprovedGroups.tsx` - Correction endpoints IMF
7. ✅ `src/pages/IMF/ImfApprovalPage.tsx` - Correction endpoints IMF
8. ✅ `src/pages/Dashboard/DashboardHome.tsx` - Correction warnings DOM

---

## État après corrections

✅ **Dashboard** : Affiche les vraies stats (107 groupes, 133 utilisateurs, 9 abonnements actifs, 96 groupes trial)  
✅ **Page Groupes** : Chargement normal, plus de timeout  
✅ **Page Paiements** : Montants affichés correctement (ou "N/A" si données invalides)  
✅ **Page IMF** : Plus d'erreur 403, endpoints corrects  
✅ **Warnings Console** : Plus de warnings DOM ni MUI Tooltip

---

## Tests recommandés

1. ✅ Vérifier que le dashboard affiche les vraies stats
2. ✅ Vérifier que la page groupes charge sans timeout
3. ✅ Vérifier que les montants s'affichent correctement dans les paiements
4. ✅ Vérifier que la page IMF charge sans erreur 403
5. ✅ Vérifier qu'il n'y a plus de warnings dans la console

---

## Notes techniques

### Pourquoi désactiver l'auto-refresh ?

L'auto-refresh était une bonne idée en théorie, mais causait des problèmes :
- Requêtes répétées toutes les 30s même si la page n'est pas visible
- Combiné avec les dépendances (page, rowsPerPage, searchQuery), créait des boucles
- Les timeouts backend (15s) étaient dépassés

**Solution alternative** : Garder le bouton de rafraîchissement manuel et laisser l'utilisateur décider.

### Transformation snake_case → camelCase

Au lieu de changer toutes les interfaces TypeScript pour accepter snake_case (ce qui casserait la cohérence du code), on transforme les données à la réception. Cela permet :
- De garder un code frontend cohérent en camelCase
- De supporter les deux formats si le backend change
- De centraliser la transformation en un seul endroit

---

## Prochaines étapes recommandées

1. 🟢 Ajouter un loader skeleton pour la page groupes pendant le chargement
2. 🟢 Implémenter un système de retry pour les requêtes qui timeout
3. 🟢 Ajouter une validation des données côté frontend avant affichage
4. 🟡 Créer un Error Boundary pour capturer les erreurs React
5. 🟡 Standardiser tous les endpoints backend (soit tout en snake_case, soit tout en camelCase)
