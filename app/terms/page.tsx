import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms and Conditions - The Connerseur',
  description: 'Terms and Conditions for The Connerseur cocktail ordering service',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a0e] to-[#2d1520] text-gray-200">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Terms and Conditions</h1>
        <p className="text-gray-400 mb-10">Last updated: February 25, 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Agreement to Terms</h2>
            <p>
              By accessing or using The Connerseur (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;) web application, you agree to be bound by these Terms and
              Conditions. If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Description of Service</h2>
            <p>
              The Connerseur is a web-based cocktail ordering application that allows users to
              browse a drink menu, place orders, and optionally receive SMS notifications about
              order status. The service is provided as-is and may be modified, suspended, or
              discontinued at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Acceptable Use</h2>
            <p>When using our service, you agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Use the service for any unlawful purpose</li>
              <li>Submit false, misleading, or fraudulent orders</li>
              <li>Attempt to interfere with or disrupt the service</li>
              <li>Abuse, spam, or misuse any feature of the application</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
            </ul>
            <p className="mt-3">
              We reserve the right to refuse service or restrict access at our discretion.
            </p>
          </section>

          <section className="bg-white/5 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-3">
              SMS Terms (Transactional Notifications)
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white">Program Name</h3>
                <p>The Connerseur &ndash; Order Notifications</p>
              </div>

              <div>
                <h3 className="font-semibold text-white">Program Description</h3>
                <p>
                  Transactional SMS updates related to user-initiated drink orders. Messages may
                  include order confirmation, preparation status, ready-for-pickup alerts, and
                  cancellation notices.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">Opt-In Method</h3>
                <p>
                  You opt in to receive transactional SMS notifications by voluntarily entering
                  your phone number on the order form and submitting your order. Consent language
                  is displayed near the phone number field before submission. Providing your phone
                  number is optional; you may place orders without it.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">Message Frequency</h3>
                <p>Message frequency varies based on your order activity.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white">Message &amp; Data Rates</h3>
                <p>Message and data rates may apply. Contact your wireless carrier for details about your plan.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white">Opt-Out</h3>
                <p>
                  You may opt out at any time by replying <strong className="text-white">STOP</strong> to
                  any message you receive from us. After opting out, you will receive a
                  confirmation message and no further SMS notifications will be sent. You may
                  still use the app to place orders.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">Help</h3>
                <p>
                  For assistance, reply <strong className="text-white">HELP</strong> to any message,
                  or contact us at{' '}
                  <a href="mailto:nicholasc.conner@gmail.com" className="text-[#d4a574] hover:underline">
                    nicholasc.conner@gmail.com
                  </a>.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">Carrier Disclaimer</h3>
                <p>
                  Wireless carriers are not liable for delayed or undelivered messages. Message
                  delivery is subject to effective transmission from your network operator.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">User Responsibilities</h2>
            <p>
              You are responsible for maintaining adequate device connectivity and ensuring your
              device and browser are compatible with the service. We are not responsible for any
              issues arising from your device, network, or internet connection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Privacy</h2>
            <p>
              Your use of the service is also governed by our{' '}
              <Link href="/privacy" className="text-[#d4a574] hover:underline">
                Privacy Policy
              </Link>
              , which describes how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Disclaimers</h2>
            <p>
              The service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
              basis without warranties of any kind, whether express or implied, including but not
              limited to implied warranties of merchantability, fitness for a particular purpose,
              or non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, The Connerseur and its operators shall not
              be liable for any indirect, incidental, special, consequential, or punitive damages
              arising out of or related to your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Changes to These Terms</h2>
            <p>
              We may update these Terms and Conditions from time to time. Changes will be
              reflected by the &ldquo;Last updated&rdquo; date at the top of this page.
              Continued use of the service after changes constitutes acceptance of the revised
              terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              State of Texas, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact Us</h2>
            <p>If you have questions about these Terms, please contact us:</p>
            <ul className="mt-2 space-y-1 ml-2">
              <li>
                Email:{' '}
                <a href="mailto:nicholasc.conner@gmail.com" className="text-[#d4a574] hover:underline">
                  nicholasc.conner@gmail.com
                </a>
              </li>
              <li>Mailing address: 2840 Fondren Drive, Dallas, TX 75205</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 flex gap-6 text-sm">
          <Link href="/privacy" className="text-[#d4a574] hover:underline">
            Privacy Policy
          </Link>
          <Link href="/" className="text-[#d4a574] hover:underline">
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
