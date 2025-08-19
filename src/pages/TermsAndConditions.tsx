import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  useSEO({
    title: "Terms and Conditions – LocalIt",
    description: "Terms and Conditions for using LocalIt platform and services.",
    canonical: window.location.origin + "/terms",
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
          <h1 className="text-lg font-semibold">Terms and Conditions</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 prose prose-gray dark:prose-invert">
        <div className="text-sm text-muted-foreground mb-6">
          Last Updated: 15 August 2025
        </div>

        <p className="text-base leading-relaxed mb-6">
          Welcome to Localit. These Terms and Conditions ("Terms") govern your use of our mobile application and platform that connects customers with retail stores and their offers.
        </p>

        <p className="text-base leading-relaxed mb-8">
          By accessing or using our application, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Service Description</h2>
          
          <h3 className="text-lg font-medium mb-3">1.1 Platform Purpose</h3>
          <p className="mb-4">Our application serves as a unified communication platform that:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Allows retail stores to list themselves and post information about offers, deals, and inventory</li>
            <li>Enables customers to discover, follow, like, and share retailer content</li>
            <li>Provides store location information and contact details</li>
            <li>Facilitates communication between retailers and customers</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">1.2 Nature of Service</h3>
          <p className="mb-2">We are a platform facilitator and do not:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Sell products directly to customers</li>
            <li>Guarantee the availability, quality, or pricing of any products</li>
            <li>Handle transactions between customers and retailers</li>
            <li>Control retailer inventory or pricing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. User Accounts and Registration</h2>
          
          <h3 className="text-lg font-medium mb-3">2.1 Account Creation</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Users may create accounts using Google login authentication</li>
            <li>Users must provide accurate and complete information</li>
            <li>Users are responsible for maintaining the confidentiality of their account credentials</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">2.2 Eligibility</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Users must be at least 18 years of age to create an account</li>
            <li>Users under 18 may use the service with parental consent and supervision</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">2.3 Account Responsibilities</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. User Conduct</h2>
          
          <h3 className="text-lg font-medium mb-3">3.1 Acceptable Use</h3>
          <p className="mb-4">Users agree to use the platform only for lawful purposes and in accordance with these Terms.</p>

          <h3 className="text-lg font-medium mb-3">3.2 Prohibited Activities</h3>
          <p className="mb-2">Users may not:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Post false, misleading, or fraudulent content</li>
            <li>Harass, abuse, or harm other users or retailers</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use automated systems to access the platform without permission</li>
            <li>Post spam, advertising, or promotional content not related to legitimate retail offers</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">3.3 Content Standards</h3>
          <p className="mb-2">All user-generated content must be:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Truthful and accurate</li>
            <li>Respectful and non-offensive</li>
            <li>Compliant with applicable laws</li>
            <li>Free of intellectual property infringement</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Retailer Terms</h2>
          
          <h3 className="text-lg font-medium mb-3">4.1 Retailer Registration</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Retailers must provide valid business information</li>
            <li>Retailers are responsible for the accuracy of their store information, contact details, and location data</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">4.2 Content Posting</h3>
          <p className="mb-2">Retailers may post:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Information about products, offers, and deals</li>
            <li>Store updates and announcements</li>
            <li>Contact information and store location details</li>
            <li>Business hours and availability information</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">4.3 Retailer Responsibilities</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Retailers are solely responsible for the accuracy of their posted content</li>
            <li>Retailers must comply with all applicable consumer protection and advertising laws</li>
            <li>Retailers must honor offers and deals as posted on the platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Intellectual Property</h2>

          <h3 className="text-lg font-medium mb-3">5.1 Platform Content</h3>
          <p className="mb-4">All content on our platform, including text, graphics, logos, and software, is owned by us or our licensors and is protected by intellectual property laws.</p>

          <h3 className="text-lg font-medium mb-3">5.2 User Content</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Users retain ownership of content they post</li>
            <li>By posting content, users grant us a non-exclusive, royalty-free license to use, display, and distribute such content on our platform</li>
            <li>Users represent that they have the right to post their content</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">5.3 Retailer Content</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Retailers retain ownership of their business content</li>
            <li>Retailers grant us permission to display their content for platform functionality</li>
            <li>Retailers are responsible for ensuring they have rights to all content they post</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Privacy and Data Protection</h2>

          <h3 className="text-lg font-medium mb-3">6.1 Data Collection</h3>
          <p className="mb-4">We collect and process personal information in accordance with our Privacy Policy, which is incorporated into these Terms by reference.</p>

          <h3 className="text-lg font-medium mb-3">6.2 Google Login</h3>
          <p className="mb-4">When you use Google login, you consent to our collection of information from your Google account as outlined in our Privacy Policy.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Disclaimers and Limitations</h2>

          <h3 className="text-lg font-medium mb-3">7.1 Platform Availability</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>We do not guarantee uninterrupted or error-free service</li>
            <li>We may modify or discontinue the service at any time</li>
            <li>We are not responsible for technical failures or internet connectivity issues</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">7.2 Third-Party Content</h3>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>We do not endorse or guarantee the accuracy of retailer-posted content</li>
            <li>We are not responsible for the quality, availability, or pricing of products or services offered by retailers</li>
            <li>Users interact with retailers at their own risk</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">7.3 Limitation of Liability</h3>
          <p className="mb-4 font-medium">TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. Indemnification</h2>
          <p className="mb-4">Users agree to indemnify and hold us harmless from any claims, damages, or expenses arising from their use of the platform or violation of these Terms.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">9. Termination</h2>

          <h3 className="text-lg font-medium mb-3">9.1 Termination by Users</h3>
          <p className="mb-4">Users may terminate their account at any time by deleting the application or contacting us.</p>

          <h3 className="text-lg font-medium mb-3">9.2 Termination by Us</h3>
          <p className="mb-4">We may terminate or suspend accounts that violate these Terms or for any reason with reasonable notice.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">10. Governing Law</h2>
          <p className="mb-4">These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Khorda, India.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">11. Changes to Terms</h2>
          <p className="mb-4">We reserve the right to modify these Terms at any time. Users will be notified of significant changes, and continued use constitutes acceptance of modified Terms.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">12. Contact Information</h2>
          <p className="mb-2">For questions about these Terms, please contact us at:</p>
          <div className="bg-muted p-4 rounded-lg">
            <p><strong>Email:</strong> accounts@localit.in</p>
            <p><strong>Address:</strong> PLOT-42422783759 SWARNAPURI, PATIA Patia Gds Khorda Orissa India 751024</p>
            <p><strong>Phone:</strong> 8962125228</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">13. Severability</h2>
          <p className="mb-4">If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">14. Entire Agreement</h2>
          <p className="mb-4">These Terms, along with our Privacy Policy, constitute the entire agreement between you and us regarding the use of our platform.</p>
        </section>

        <div className="bg-brand/10 p-6 rounded-lg mt-8">
          <p className="text-center font-medium">
            By using our application, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
