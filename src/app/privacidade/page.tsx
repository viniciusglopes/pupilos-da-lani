import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold text-black mb-8 uppercase tracking-wide">
            Politica de Privacidade
          </h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Ultima atualizacao:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-black mb-4 uppercase tracking-wide">
                1. Informacoes que Coletamos
              </h2>
              <p className="text-gray-700 mb-4">
                Coletamos apenas as informacoes necessarias para apresentar o portfolio profissional dos modelos:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Nome completo</li>
                <li>Medidas corporais (altura, busto, cintura, quadril)</li>
                <li>Caracteristicas fisicas (cor dos olhos e cabelo)</li>
                <li>Especialidades profissionais</li>
                <li>Localizacao (cidade/estado)</li>
                <li>Informacoes de contato (Instagram, email, telefone) - APENAS com consentimento explicito</li>
                <li>Fotos e videos de portfolio profissional</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-black mb-4 uppercase tracking-wide">
                2. Como Usamos suas Informacoes
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Exibir o portfolio profissional na plataforma</li>
                <li>Conectar modelos com oportunidades profissionais</li>
                <li>Facilitar o contato entre modelos e contratantes (apenas com consentimento)</li>
                <li>Melhorar nossos servicos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-black mb-4 uppercase tracking-wide">
                3. Base Legal (LGPD)
              </h2>
              <p className="text-gray-700 mb-4">
                Processamos seus dados pessoais com base nas seguintes bases legais:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Consentimento:</strong> Para informacoes de contato e exibicao publica</li>
                <li><strong>Execucao de contrato:</strong> Para servicos de portfolio profissional</li>
                <li><strong>Interesse legitimo:</strong> Para melhorias na plataforma</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-black mb-4 uppercase tracking-wide">
                4. Seus Direitos
              </h2>
              <p className="text-gray-700 mb-4">
                Conforme a LGPD, voce tem direito a:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Confirmar a existencia de tratamento de dados</li>
                <li>Acessar seus dados</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Anonimizar, bloquear ou eliminar dados desnecessarios</li>
                <li>Revogar o consentimento</li>
                <li>Solicitar portabilidade dos dados</li>
                <li>Excluir dados pessoais tratados com seu consentimento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-black mb-4 uppercase tracking-wide">
                5. Compartilhamento de Dados
              </h2>
              <p className="text-gray-700 mb-4">
                Nao vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais. 
                Seus dados sao exibidos publicamente na plataforma apenas com seu consentimento explicito.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-black mb-4 uppercase tracking-wide">
                6. Seguranca
              </h2>
              <p className="text-gray-700 mb-4">
                Implementamos medidas tecnicas e organizacionais adequadas para proteger seus dados pessoais 
                contra acesso nao autorizado, alteracao, divulgacao ou destruicao.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-black mb-4 uppercase tracking-wide">
                7. Retencao de Dados
              </h2>
              <p className="text-gray-700 mb-4">
                Mantemos seus dados apenas pelo tempo necessario para os fins declarados ou conforme 
                exigido por lei. Voce pode solicitar a exclusao de seus dados a qualquer momento.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-black mb-4 uppercase tracking-wide">
                8. Contato
              </h2>
              <p className="text-gray-700 mb-4">
                Para exercer seus direitos ou esclarecer duvidas sobre esta politica:
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li><strong>Email:</strong> privacidade@pupiloslani.com.br</li>
                <li><strong>Telefone:</strong> (31) 9 9999-9999</li>
                <li><strong>Endereco:</strong> Minas Gerais, Brasil</li>
              </ul>
            </section>

            <div className="border border-gray-300 p-6 mt-8">
              <h3 className="text-sm font-semibold text-black mb-2 uppercase tracking-wide">
                Importante para Modelos
              </h3>
              <p className="text-gray-700">
                Ao se cadastrar em nossa plataforma, voce esta consentindo expressamente com a 
                exibicao publica de suas informacoes profissionais. Voce pode revogar este 
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
