import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  useSEO({
    title: "Privacy Policy – LocalIt",
    description: "Privacy Policy for LocalIt platform and how we handle your personal information.",
    canonical: window.location.origin + "/privacy",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 prose prose-gray dark:prose-invert">
        <div className="text-sm text-muted-foreground mb-6">
          Last Updated: 15 August 2025
        </div>

        <p className="text-base leading-relaxed mb-8">
          This Privacy Policy describes how Localit collects, uses, and protects your personal information when you use our mobile application and services.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
          
          <h3 className="text-lg font-medium mb-3">1.1 Information You Provide Directly</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li><strong>Google Account Information:</strong> When you sign in with Google, we collect basic profile information including name, email address, and profile picture</li>
            <li><strong>Profile Information:</strong> Any additional information you choose to add to your profile</li>
            <li><strong>User-Generated Content:</strong> Posts, likes, shares, follows, and comments you make on the platform</li>
            <li><strong>Communication Data:</strong> Messages or inquiries you send through the platform</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">1.2 Information We Collect Automatically</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers</li>
            <li><strong>Usage Data:</strong> How you interact with the app, features used, time spent</li>
            <li><strong>Location Data:</strong> Approximate location (if you grant permission) to show nearby retailers</li>
            <li><strong>Log Data:</strong> IP address, browser type, access times, and referring URLs</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">1.3 Information from Third Parties</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li><strong>Google Login Data:</strong> Information from your Google account as per Google's privacy policies</li>
            <li><strong>Retailer Information:</strong> Business details, offers, and content posted by retailers on our platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
          
          <h3 className="text-lg font-medium mb-3">2.1 Primary Uses</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li><strong>Account Management:</strong> Creating and managing your user account</li>
            <li><strong>Platform Functionality:</strong> Enabling you to follow retailers, receive updates, and view offers</li>
            <li><strong>Personalization:</strong> Showing relevant retailers and offers based on your interests and location</li>
            <li><strong>Communication:</strong> Sending notifications about followed retailers and platform updates</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">2.2 Secondary Uses</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li><strong>Analytics:</strong> Understanding user behavior to improve our services</li>
            <li><strong>Security:</strong> Protecting against fraud, abuse, and security threats</li>
            <li><strong>Legal Compliance:</strong> Complying with applicable laws and regulations</li>
            <li><strong>Business Operations:</strong> Managing our business and improving our services</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">2.3 Marketing Communications</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>We may send promotional emails about platform features and retailer highlights</li>
            <li>You can opt out of marketing communications at any time</li>
            <li>Transactional communications (account updates, security notifications) cannot be opted out of</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
          
          <h3 className="text-lg font-medium mb-3">3.1 We Share Information In The Following Cases:</h3>
          
          <h4 className="text-base font-medium mb-2">With Retailers:</h4>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Your public interactions (likes, shares, follows) are visible to retailers</li>
            <li>Profile information necessary for platform functionality</li>
          </ul>

          <h4 className="text-base font-medium mb-2">With Other Users:</h4>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Your public profile information and activity on the platform</li>
            <li>Content you choose to make public (likes, shares, follows)</li>
          </ul>

          <h4 className="text-base font-medium mb-2">With Service Providers:</h4>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Third-party services that help us operate our platform (hosting, analytics, customer support)</li>
            <li>These providers are contractually obligated to protect your information</li>
          </ul>

          <h4 className="text-base font-medium mb-2">For Legal Reasons:</h4>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>When required by law, regulation, or court order</li>
            <li>To protect our rights, property, or safety, or that of our users</li>
            <li>In connection with business transactions (mergers, acquisitions)</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">3.2 We Do Not:</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Sell your personal information to third parties</li>
            <li>Share your private messages or personal details without consent</li>
            <li>Use your information for purposes unrelated to our platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
          
          <h3 className="text-lg font-medium mb-3">4.1 Security Measures</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>We use industry-standard security measures to protect your information</li>
            <li>Data is transmitted using secure SSL encryption</li>
            <li>Access to personal information is limited to authorized personnel</li>
            <li>Regular security assessments and updates</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">4.2 Data Storage</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Your information is stored on secure servers</li>
            <li>We retain information only as long as necessary for platform functionality</li>
            <li>Inactive accounts may have data deleted after extended periods of inactivity</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Your Privacy Rights</h2>

          <h3 className="text-lg font-medium mb-3">5.1 Access and Control</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li><strong>Account Information:</strong> You can view and update your profile information within the app</li>
            <li><strong>Download Data:</strong> You can request a copy of your personal information</li>
            <li><strong>Delete Account:</strong> You can delete your account at any time, which will remove your personal information</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">5.2 Communication Preferences</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li><strong>Notifications:</strong> Control what notifications you receive through app settings</li>
            <li><strong>Email Communications:</strong> Unsubscribe from marketing emails using the unsubscribe link</li>
            <li><strong>Follow Management:</strong> Unfollow retailers at any time to stop receiving their updates</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">5.3 Data Portability</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>You can request to download your data in a structured, machine-readable format</li>
            <li>We will provide this data within 30 days of your request</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Cookies and Tracking Technologies</h2>

          <h3 className="text-lg font-medium mb-3">6.1 Usage</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>We use cookies and similar technologies to enhance user experience</li>
            <li>These help us remember your preferences and analyze usage patterns</li>
            <li>Third-party analytics services may also use tracking technologies</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">6.2 Control</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>You can control cookie settings through your device or browser settings</li>
            <li>Disabling cookies may limit some platform functionality</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Children's Privacy</h2>

          <h3 className="text-lg font-medium mb-3">7.1 Age Restrictions</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Our platform is not intended for children under 13</li>
            <li>We do not knowingly collect information from children under 13</li>
            <li>If we become aware of such collection, we will delete the information immediately</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">7.2 Parental Consent</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Users between 13-18 should have parental consent before using our platform</li>
            <li>Parents may contact us to request deletion of their child's information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. International Data Transfers</h2>

          <h3 className="text-lg font-medium mb-3">8.1 Data Location</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Your information may be stored and processed in India or other countries</li>
            <li>We ensure appropriate safeguards are in place for international transfers</li>
            <li>By using our platform, you consent to such transfers</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">9. Changes to Privacy Policy</h2>

          <h3 className="text-lg font-medium mb-3">9.1 Updates</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>We may update this Privacy Policy from time to time</li>
            <li>Significant changes will be communicated through the app or email</li>
            <li>Continued use after changes constitutes acceptance of the updated policy</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">9.2 Notification</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>We will provide 30 days notice for material changes</li>
            <li>You can review the updated policy before it takes effect</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">10. Third-Party Links and Services</h2>

          <h3 className="text-lg font-medium mb-3">10.1 External Links</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Our platform may contain links to retailer websites or third-party services</li>
            <li>We are not responsible for the privacy practices of external websites</li>
            <li>We encourage you to read their privacy policies</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">10.2 Integration Services</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li><strong>Google Services:</strong> Subject to Google's privacy policy and terms</li>
            <li><strong>Analytics Services:</strong> May collect additional usage data as per their policies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">11. Data Retention</h2>

          <h3 className="text-lg font-medium mb-3">11.1 Retention Periods</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li><strong>Account Data:</strong> Retained while your account is active</li>
            <li><strong>Usage Data:</strong> Retained for up to 2 years for analytics purposes</li>
            <li><strong>Communication Data:</strong> Retained as necessary for customer service</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">11.2 Deletion</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>You can request deletion of your data at any time</li>
            <li>Some information may be retained for legal or security purposes</li>
            <li>Anonymized data may be retained for analytics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
          <p className="mb-4">If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
          <div className="bg-muted p-4 rounded-lg">
            <p><strong>Email:</strong> accounts@localit.in</p>
            <p><strong>Address:</strong> PLOT-42422783759 SWARNAPURI, PATIA Patia Gds Khorda Orissa India 751024</p>
            <p><strong>Phone:</strong> 8962125228</p>
            <p><strong>Data Protection Officer:</strong> [If applicable]</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">13. Compliance</h2>

          <h3 className="text-lg font-medium mb-3">13.1 Legal Framework</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>We comply with applicable data protection laws in India</li>
            <li>We adhere to industry best practices for data privacy and security</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">13.2 Grievance Redressal</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>You can file complaints regarding privacy issues through our contact information</li>
            <li>We will respond to privacy concerns within 30 days</li>
          </ul>
        </section>

        <div className="bg-brand/10 p-6 rounded-lg mt-8">
          <p className="text-center font-medium">
            By using our application, you acknowledge that you have read and understood this Privacy Policy and agree to the collection, use, and disclosure of your information as described herein.
          </p>
        </div>
      </div>
    </div>
  );
}
