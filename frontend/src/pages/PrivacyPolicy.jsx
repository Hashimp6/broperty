import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
        
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Introduction
            </h2>
            <p>
              We respect your privacy and are committed to protecting your personal
              information. This Privacy Policy explains how we collect, use, and
              safeguard your data when you use our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, phone number, and email address</li>
              <li>Location data (with your permission)</li>
              <li>Property search preferences</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To show nearby and relevant properties</li>
              <li>To respond to enquiries and support requests</li>
              <li>To improve website performance and experience</li>
              <li>To ensure platform security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Data Sharing
            </h2>
            <p>
              We do not sell your personal data. Information is shared only with
              trusted partners or agents when required to provide our services or
              comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Cookies
            </h2>
            <p>
              We use cookies to improve functionality and analyze traffic. You can
              control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Your Rights
            </h2>
            <p>
              You have the right to access, update, or request deletion of your
              personal data. You may also withdraw consent at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <p className="mt-2">
              📧 <strong>Email:</strong> support@yourdomain.com <br />
              📞 <strong>Phone:</strong> +91-XXXXXXXXXX
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
