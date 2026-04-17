import React from 'react';
import { Button } from './Button';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="pt-24 pb-12 bg-cream animate-fade-in-up min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-8">
          <Button variant="text" onClick={onBack} className="pl-0 mb-4">← Back to Home</Button>
        </div>

        <div className="mb-12">
          <span className="text-gold-500 font-sans text-xs tracking-[0.3em] uppercase mb-4 block">Legal</span>
          <h1 className="font-serif text-5xl md:text-6xl text-navy-900 mb-8">Privacy Policy</h1>
          <p className="font-sans text-sm text-gray-500 mb-8">Last Updated: March 2026</p>
        </div>

        <div className="font-sans text-gray-700 leading-relaxed space-y-8">
          <section>
            <h2 className="font-serif text-3xl text-navy-900 mb-4">Introduction</h2>
            <p>
              Weiss & Goldring ("we," "our," or "us") respects your privacy and is committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit the website weissgoldring.com (our "Website") and our practices for collecting, using, maintaining, protecting, and disclosing that information.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl text-navy-900 mb-4">Information We Collect</h2>
            <p>
              We collect several types of information from and about users of our Website, including information:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>By which you may be personally identified, such as name, postal address, e-mail address, telephone number, or any other identifier by which you may be contacted online or offline ("personal information").</li>
              <li>That is about you but individually does not identify you.</li>
              <li>About your internet connection, the equipment you use to access our Website, and usage details.</li>
            </ul>
          </section>
          
          <section className="bg-gold-100/30 p-8 border-l-4 border-gold-500 rounded-r-lg">
            <h2 className="font-serif text-3xl text-navy-900 mb-4">Style Concierge Chat Interactivity</h2>
            <p className="mb-4">
              Our Website includes an interactive virtual "Style Concierge" chat feature (TedBot). Please be aware that when you interact with the chat feature:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Data Collection:</strong> We collect and store the content of your chat conversations, including any personal preferences, sizing information, and contact details you explicitly provide during the dialogue.</li>
              <li><strong>Usage Tracking:</strong> We track usage patterns, interaction frequency, and common inquiries to improve the AI's contextual understanding.</li>
              <li><strong>Third-Party Processing:</strong> The conversational data may be processed securely through our authorized third-party artificial intelligence partners to generate responses and facilitate the concierge service.</li>
            </ul>
            <p className="mt-4 font-medium italic">
              By using the Style Concierge chat box, you explicitly acknowledge and consent to the collection, storage, and processing of your chat data as described herein.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl text-navy-900 mb-4">How We Use Your Information</h2>
            <p>
              We use information that we collect about you or that you provide to us, including any personal information:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>To present our Website and its contents to you.</li>
              <li>To provide you with information, products, or services that you request from us.</li>
              <li>To fulfill any other purpose for which you provide it, such as completing an appointment request or virtual consultation.</li>
              <li>To notify you about changes to our Website or any products or services we offer.</li>
              <li>To improve our customer service and personalize your experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-3xl text-navy-900 mb-4">Disclosure of Your Information</h2>
            <p>
              We do not sell, trade, or otherwise transfer your Personally Identifiable Information to outside parties unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl text-navy-900 mb-4">Data Security</h2>
            <p>
              We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. Unfortunately, the transmission of information via the internet is not completely secure. Although we do our best to protect your personal information, we cannot guarantee the security of your personal information transmitted to our Website.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl text-navy-900 mb-4">Contact Information</h2>
            <p>
              To ask questions or comment about this privacy policy and our privacy practices, contact us via mail at:
            </p>
            <p className="mt-4 font-medium">
              Weiss & Goldring<br />
              3601 Masonic Drive<br />
              Alexandria, LA 71301
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
