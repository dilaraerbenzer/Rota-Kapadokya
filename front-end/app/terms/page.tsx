import React from 'react';
import { FileText, AlertTriangle, Info } from 'lucide-react';

export const metadata = {
  title: 'Kullanım Şartları - RotaKapadokya',
  description: 'RotaKapadokya hackathon projesi kullanım şartları.'
}

const TermsPage = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
           <FileText className="mx-auto h-16 w-16 text-blue-400 mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            Kullanım Şartları
          </h1>
          <p className="text-xl text-slate-300">
            RotaKapadokya Hackathon Projesi
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-6 shadow-xl">
            <h2 className="flex items-center text-xl font-semibold mb-3 text-cyan-400">
               <Info className="h-5 w-5 mr-2" /> Genel Bilgilendirme
            </h2>
            <p className="text-slate-300 leading-relaxed">
              RotaKapadokya, Bilkent Üniversitesi öğrencileri tarafından ("Halenteck" takımı) bir hackathon kapsamında geliştirilmiş bir prototip projesidir. Bu platform, Kapadokya bölgesindeki oteller ve acentalar için yapay zeka destekli rezervasyon ve öneri yeteneklerini sergilemek amacıyla oluşturulmuştur.
            </p>
          </div>

           <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-6 shadow-xl">
            <h2 className="flex items-center text-xl font-semibold mb-3 text-amber-400">
              <AlertTriangle className="h-5 w-5 mr-2" /> Sorumluluk Reddi
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Bu platform bir prototip olduğundan, içerdiği bilgiler (örneğin, otel bilgileri, tur detayları, fiyatlar) temsili veya güncel olmayabilir. Yapılan rezervasyonlar veya sunulan öneriler gerçek ticari işlemler veya taahhütler olarak kabul edilmemelidir. Platformun kullanımından kaynaklanabilecek herhangi bir yanlışlık, eksiklik veya problemden geliştirici takım sorumlu tutulamaz.
            </p>
          </div>

           <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-6 shadow-xl">
            <h2 className="flex items-center text-xl font-semibold mb-3 text-purple-400">
              <FileText className="h-5 w-5 mr-2" /> Kullanım Amacı
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Platform, hackathon süresince ve sonrasında projenin yeteneklerini gösterme ve değerlendirme amacıyla kullanılmalıdır. Ticari amaçlarla kullanılması veya gerçek rezervasyon işlemleri için temel alınması önerilmez.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-6 shadow-xl">
            <h2 className="flex items-center text-xl font-semibold mb-3 text-teal-400">
              <Info className="h-5 w-5 mr-2" /> Veri Gizliliği
            </h2>
            <p className="text-slate-300 leading-relaxed">
               Platform üzerinde (varsa) paylaştığınız veriler, yalnızca projenin işleyişi ve değerlendirilmesi amacıyla kullanılabilir. Verilerinizin ticari amaçlarla paylaşılmayacağını veya satılmayacağını taahhüt ederiz. Ancak, hackathon projelerinin doğası gereği, veri güvenliği konusunda kurumsal düzeyde garantiler verilememektedir.
            </p>
          </div>

           <div className="text-center mt-10">
            <p className="text-slate-400 text-sm">
              Bu platformu kullanarak yukarıdaki şartları kabul etmiş sayılırsınız.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsPage; 