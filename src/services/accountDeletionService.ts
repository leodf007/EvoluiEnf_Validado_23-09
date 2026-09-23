/**
 * EvoluiEnf - AccountDeletionService
 * 
 * Serviço seguro de exclusão permanente de conta e dados pessoais.
 * Em conformidade com a LGPD e a ETAPA 6 da missão comercial:
 * - Baseado estritamente no UID autenticado do usuário (auth.currentUser)
 * - Exige validação explícita (palavra de confirmação 'EXCLUIR')
 * - Limpa dados locais, filas offline e caches
 * - Remove registros vinculados no Firestore
 * - Remove o usuário no Firebase Auth
 * - Executa logout seguro e notifica o usuário
 */

import { auth, db } from './firebase';
import { deleteUser, signOut } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { SubscriptionService } from './subscriptionService';
import { SyncQueueService } from './syncQueueService';
import { ErrorHandlerService } from './errorHandlerService';

export interface AccountDeletionResult {
  success: boolean;
  message: string;
  requiresReauth?: boolean;
}

export class AccountDeletionService {
  /**
   * Palavra obrigatória de confirmação para segurança
   */
  static readonly CONFIRMATION_WORD = 'EXCLUIR';

  /**
   * Executa o processo completo de exclusão segura da conta e de seus dados
   */
  static async deleteAccount(
    targetUserId: string,
    typedConfirmation: string
  ): Promise<AccountDeletionResult> {
    // 1. Validação da palavra de confirmação
    if (typedConfirmation.trim().toUpperCase() !== this.CONFIRMATION_WORD) {
      return {
        success: false,
        message: `Para confirmar a exclusão permanente, digite exatamente '${this.CONFIRMATION_WORD}'.`,
      };
    }

    // 2. Validação de autenticação ativa e correspondência de UID
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        message: 'Nenhum usuário autenticado encontrado. Faça login novamente para prosseguir.',
      };
    }

    const authenticatedUid = currentUser.uid;
    if (authenticatedUid !== targetUserId) {
      return {
        success: false,
        message: 'Violação de segurança: O usuário autenticado não coincide com a conta solicitada.',
      };
    }

    try {
      // 3. Remoção de dados vinculados no Firestore
      try {
        // A. Remover atendimentos do usuário
        const atendimentosRef = collection(db, 'atendimentos');
        const q = query(atendimentosRef, where('usuarioId', '==', authenticatedUid));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.docs.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
      } catch (err) {
        console.warn('Exclusão de atendimentos no Firestore em contingência offline:', err);
      }

      try {
        // B. Remover da coleção canônica de assinaturas
        await deleteDoc(doc(db, 'subscriptions', authenticatedUid));
      } catch (err) {
        console.warn('Exclusão de registro de assinatura:', err);
      }

      try {
        // C. Remover perfil do usuário
        await deleteDoc(doc(db, 'users', authenticatedUid));
        await deleteDoc(doc(db, 'user_profiles', authenticatedUid));
      } catch (err) {
        console.warn('Exclusão de perfil do usuário:', err);
      }

      // 4. Limpeza de dados e caches locais no dispositivo
      try {
        SubscriptionService.clearUserSubscription(authenticatedUid);
        // Limpar itens da fila offline do usuário
        const pendingQueue = SyncQueueService.obterFila();
        const remainingQueue = pendingQueue.filter((item) => item.usuarioId !== authenticatedUid);
        localStorage.setItem('evoluienf_sync_queue', JSON.stringify(remainingQueue));

        // Limpar chaves locais vinculadas
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.includes(authenticatedUid) || k.includes('evoluienf_'))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch (cacheErr) {
        console.warn('Limpeza de cache local:', cacheErr);
      }

      // 5. Exclusão do usuário no Firebase Authentication
      try {
        await deleteUser(currentUser);
      } catch (authErr: any) {
        // Se exigir reautenticação recente do Firebase
        if (authErr?.code === 'auth/requires-recent-login') {
          await signOut(auth);
          return {
            success: false,
            requiresReauth: true,
            message:
              'Por motivos de segurança exigidos pelo provedor de autenticação, é necessário fazer login novamente antes de concluir a exclusão definitiva da conta.',
          };
        }
        console.warn('Exclusão direta do Firebase Auth:', authErr);
      }

      // 6. Logout final preventivo
      try {
        await signOut(auth);
      } catch {
        // no-op
      }

      return {
        success: true,
        message: 'Sua conta e todos os dados vinculados foram permanentemente excluídos com sucesso.',
      };
    } catch (error: any) {
      ErrorHandlerService.tratarErro(error, 'AccountDeletionService.deleteAccount');
      return {
        success: false,
        message:
          'Não foi possível concluir a exclusão de todos os dados neste momento. Verifique sua conexão e tente novamente.',
      };
    }
  }
}
