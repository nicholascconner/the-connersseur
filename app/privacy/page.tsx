import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - The Connerseur',
  description: 'Privacy Policy for The Connerseur cocktail ordering service',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a0e] to-[#2d1520] text-gray-200">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-10">Last updated: February 25, 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
            <p>
              The Connerseur (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates a
              cocktail ordering web application. This Privacy Policy explains how we collect, use,
              and protect your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Information We Collect</h2>
            <p>When you place an order or interact with our service, we may collect:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Name (optional)</li>
              <li>Phone number (optional)</li>
              <li>Order details (drinks, customizations, preferences)</li>
              <li>Timestamps of orders and interactions</li>
              <li>Basic device and log information (browser type, IP address, pages visited)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Process and fulfill your drink orders</li>
              <li>Send transactional SMS notifications about your order status (e.g., order received, in progress, ready for pickup, or canceled)</li>
              <li>Improve and maintain our service</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">SMS Messaging</h2>
            <p>
              If you provide your phone number, we may send you transactional text messages
              related to your drink orders. These messages are strictly limited to order status
              updates&mdash;such as confirmation that your order was received, that it is being
              prepared, that it is ready for pickup, or that it has been canceled.
            </p>
            <p className="mt-3">
              <strong className="text-white">We do not use your phone number for marketing, promotions, or advertising of any kind.</strong>
            </p>
            <p className="mt-3">
              Message frequency varies. Message and data rates may apply.
            </p>
            <p className="mt-3">
              You can opt out of SMS notifications at any time by replying <strong className="text-white">STOP</strong> to
              any message. To get help, reply <strong className="text-white">HELP</strong>. After
              opting out, you will no longer receive text messages from us. You may still place
              orders through the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Information Sharing</h2>
            <p>
              We do not sell your personal information. We do not share your information with
              third parties for their marketing purposes.
            </p>
            <p className="mt-3">
              We may share limited information with trusted service providers solely to operate
              and deliver our service, including:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Twilio &mdash; for SMS message delivery</li>
              <li>Vercel &mdash; for application hosting</li>
            </ul>
            <p className="mt-3">
              We may also disclose information when required by law, to protect the safety of our
              users, to prevent fraud, or to comply with a legal process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Retention</h2>
            <p>
              We retain order and contact information only as long as reasonably needed to
              operate the service, fulfill orders, and support troubleshooting. When your data is
              no longer needed for these purposes, we delete or anonymize it.
            </p>
            <p className="mt-3">
              You may request deletion of your personal information at any time by contacting us
              using the details below. We will process deletion requests promptly and confirm
              once complete.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Security</h2>
            <p>
              We use reasonable technical and organizational measures to protect your information.
              However, no method of electronic transmission or storage is completely secure, and
              we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If we make material changes, we
              will update the &ldquo;Last updated&rdquo; date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, wish to request data deletion, or
              need assistance, please contact us:
            </p>
            <ul className="mt-2 space-y-1 ml-2">
              <li>Email: <a href="mailto:nicholasc.conner@gmail.com" className="text-[#d4a574] hover:underline">nicholasc.conner@gmail.com</a></li>
              <li>Mailing address: 2840 Fondren Drive, Dallas, TX 75205</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 flex gap-6 text-sm">
          <Link href="/terms" className="text-[#d4a574] hover:underline">
            Terms of Service
          </Link>
          <Link href="/" className="text-[#d4a574] hover:underline">
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
