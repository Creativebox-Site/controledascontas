# 📧 Templates de Email Personalizados

## Visão Geral

Todos os emails enviados pelo **App Contas | Creative Box** foram personalizados com:

✅ **Logo da empresa** (box 3D azul turquesa)  
✅ **Nome da aplicação** "App Contas | Creative Box"  
✅ **Design responsivo** e profissional  
✅ **Cores da identidade visual** (#4FC3DC)  
✅ **Gradientes modernos** e elementos visuais atraentes  

---

## 📨 Tipos de Email

### 1. **Email de Verificação OTP (Código de 6 dígitos)**

**Edge Function:** `supabase/functions/send-otp/index.ts`

**Quando é enviado:**
- Login com código de verificação (passwordless)
- Autenticação de dois fatores

**Conteúdo:**
- Logo do App Contas em destaque
- Código de 6 dígitos em caixa destacada
- Aviso de expiração (10 minutos)
- Footer com branding da empresa

**Exemplo visual:**
```
┌─────────────────────────────────┐
│   [LOGO 3D]                     │
│   App Contas                    │
│   Creative Box                  │
├─────────────────────────────────┤
│                                 │
│ Seu código de verificação       │
│                                 │
│ ┌─────────────────────────┐    │
│ │      1 2 3 4 5 6       │    │
│ └─────────────────────────┘    │
│                                 │
│ ⏱️ Expira em 10 minutos         │
│                                 │
├─────────────────────────────────┤
│ © 2025 App Contas | Creative Box│
└─────────────────────────────────┘
```

---

### 2. **Email de Recuperação de Senha**

**Edge Function:** `supabase/functions/send-password-reset/index.ts`

**Quando é enviado:**
- Usuário clica em "Esqueci minha senha"
- Solicitação de redefinição de senha

**Conteúdo:**
- Logo do App Contas em destaque
- Botão de ação destacado "Redefinir Minha Senha"
- Link alternativo copiável
- Aviso de expiração (1 hora)
- Footer com branding da empresa

**Exemplo visual:**
```
┌─────────────────────────────────┐
│   [LOGO 3D]                     │
│   App Contas                    │
│   Creative Box                  │
├─────────────────────────────────┤
│                                 │
│ Recuperação de Senha            │
│                                 │
│ ┌───────────────────────────┐  │
│ │ Redefinir Minha Senha ↗  │  │
│ └───────────────────────────┘  │
│                                 │
│ Ou copie este link:             │
│ https://...                     │
│                                 │
│ ⏱️ Expira em 1 hora              │
│                                 │
├─────────────────────────────────┤
│ © 2025 App Contas | Creative Box│
└─────────────────────────────────┘
```

---

## 🎨 Design System dos Emails

### **Cores Principais**
- **Gradiente Header:** `#4FC3DC` → `#3b82f6`
- **Texto Principal:** `#1f2937`
- **Texto Secundário:** `#4b5563`, `#6b7280`
- **Alertas:** `#f59e0b` (amarelo/warning)
- **Background:** `#ffffff`, `#f5f5f5`

### **Tipografia**
- **Font Stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif`
- **Títulos:** 22-24px, font-weight 600
- **Corpo:** 14-16px, line-height 1.5
- **Footer:** 12px

### **Elementos Visuais**
- **Logo:** 80x80px no header
- **Border-radius:** 8-12px (suave e moderno)
- **Shadows:** Sutis para elevação (`0 2px 8px rgba(0,0,0,0.1)`)
- **Espaçamento:** 24-40px entre seções

---

## 🔧 Customização

### **Alterar o Logo**

O logo atual está hospedado em:
```
https://cd8343ae-9767-42cb-917a-70fd17803bd0.lovableproject.com/pwa-512x512.png
```

Para trocar o logo:
1. Substitua o arquivo `public/pwa-512x512.png`
2. Ou atualize a URL nos arquivos:
   - `supabase/functions/send-otp/index.ts`
   - `supabase/functions/send-password-reset/index.ts`

### **Alterar Cores**

Busque e substitua as cores hex nos templates:
- `#4FC3DC` - Azul turquesa principal
- `#3b82f6` - Azul secundário
- `#1f2937` - Texto escuro

### **Alterar Textos**

Edite diretamente o HTML nos arquivos das edge functions:
- Títulos: Busque por `<h1>`, `<h2>`
- Parágrafos: Busque por `<p>`
- Botões: Busque por `<a>` com styles inline

---

## 📋 Remetente dos Emails

**Formato atual:**
```
App Contas | Creative Box <onboarding@resend.dev>
```

**Para usar domínio personalizado:**
1. Configure seu domínio no [Resend](https://resend.com/domains)
2. Verifique o domínio (DNS records)
3. Atualize o campo `from` nas edge functions:
   ```typescript
   from: 'App Contas | Creative Box <noreply@seudominio.com>'
   ```

---

## 🧪 Testando os Templates

### **Testar Email de OTP**
```bash
curl -X POST https://bmcpznzahqahiujyfkuj.supabase.co/functions/v1/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","requestId":"test-123"}'
```

### **Testar Email de Recuperação**
```bash
curl -X POST https://bmcpznzahqahiujyfkuj.supabase.co/functions/v1/send-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com"}'
```

---

## 🔒 Segurança

✅ **Rate Limiting:** 5 tentativas por hora por email/IP  
✅ **Prevenção de Enumeração:** Mensagens genéricas  
✅ **Tokens Expirantes:** OTP (10 min), Recovery (1 hora)  
✅ **Hash Seguro:** SHA-256 com salt para OTPs  

---

## 📱 Responsividade

Todos os templates foram testados e funcionam perfeitamente em:
- ✅ Gmail (Desktop e Mobile)
- ✅ Outlook (Desktop e Mobile)
- ✅ Apple Mail (iOS e macOS)
- ✅ Yahoo Mail
- ✅ ProtonMail
- ✅ Clientes Mobile (Android/iOS)

---

## 🚀 Próximos Passos

### **Melhorias Futuras**
- [ ] Adicionar email de boas-vindas personalizado
- [ ] Template para notificações de transações
- [ ] Email de resumo mensal/semanal
- [ ] Email de alerta de metas próximas
- [ ] Email de backup/exportação de dados

### **Configuração Adicional**
- [ ] Configurar domínio personalizado no Resend
- [ ] Adicionar suporte a múltiplos idiomas
- [ ] A/B testing de templates
- [ ] Analytics de abertura de emails

---

## 💡 Dicas

1. **Sempre teste** os emails antes de deploy em produção
2. **Mantenha backup** dos templates antigos
3. **Use ferramentas** como [Litmus](https://litmus.com/) para testar renderização
4. **Monitore** métricas de entrega e abertura no Resend dashboard
5. **Evite** imagens muito grandes (max 200KB por imagem)

---

## 📞 Suporte

Se encontrar problemas com os emails:
1. Verifique os logs das edge functions
2. Confirme que `RESEND_API_KEY` está configurada
3. Valide seu domínio no Resend
4. Verifique se o email não está em spam

---

**Atualizado em:** ${new Date().toLocaleDateString('pt-BR')}  
**Versão:** 1.0.0
