import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Política de Privacidade
          </h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Informações que Coletamos
              </h2>
              <p className="text-gray-700 mb-4">
                Coletamos apenas as informações necessárias para apresentar o portfólio profissional dos modelos:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Nome completo</li>
                <li>Medidas corporais (altura, busto, cintura, quadril)</li>
                <li>Características físicas (cor dos olhos e cabelo)</li>
                <li>Especialidades profissionais</li>
                <li>Localização (cidade/estado)</li>
                <li>Informações de contato (Instagram, email, telefone) - APENAS com consentimento explícito</li>
                <li>Fotos e vídeos de portfólio profissional</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Como Usamos suas Informações
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Exibir o portfólio profissional na plataforma</li>
                <li>Conectar modelos com oportunidades profissionais</li>
                <li>Facilitar o contato entre modelos e contratantes (apenas com consentimento)</li>
                <li>Melhorar nossos serviços</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Base Legal (LGPD)
              </h2>
              <p className="text-gray-700 mb-4">
                Processamos seus dados pessoais com base nas seguintes bases legais:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Consentimento:</strong> Para informações de contato e exibição pública</li>
                <li><strong>Execução de contrato:</strong> Para serviços de portfólio profissional</li>
                <li><strong>Interesse legítimo:</strong> Para melhorias na plataforma</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Seus Direitos
              </h2>
              <p className="text-gray-700 mb-4">
                Conforme a LGPD, você tem direito a:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Anonimizar, bloquear ou eliminar dados desnecessários</li>
                <li>Revogar o consentimento</li>
                <li>Solicitar portabilidade dos dados</li>
                <li>Excluir dados pessoais tratados com seu consentimento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Compartilhamento de Dados
              </h2>
              <p className="text-gray-700 mb-4">
                Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais. 
                Seus dados são exibidos publicamente na plataforma apenas com seu consentimento explícito.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Segurança
              </h2>
              <p className="text-gray-700 mb-4">
                Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais 
                contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Retenção de Dados
              </h2>
              <p className="text-gray-700 mb-4">
                Mantemos seus dados apenas pelo tempo necessário para os fins declarados ou conforme 
                exigido por lei. Você pode solicitar a exclusão de seus dados a qualquer momento.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Contato
              </h2>
              <p className="text-gray-700 mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política:
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li><strong>Email:</strong> privacidade@pupiloslani.com.br</li>
                <li><strong>Telefone:</strong> (31) 9 9999-9999</li>
                <li><strong>Endereço:</strong> Minas Gerais, Brasil</li>
              </ul>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Importante para Modelos
              </h3>
              <p className="text-blue-800">
                Ao se cadastrar em nossa plataforma, você está consentindo expressamente com a 
                exibição pública de suas informações profissionais. Você pode revogar este 
                consentimento a qualquer momento entrando em contato conosco.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}