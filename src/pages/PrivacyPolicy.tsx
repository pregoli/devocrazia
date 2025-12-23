import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <Layout
      title="Privacy Policy"
      description="Privacy Policy for Devocrazia - how we handle your data and protect your privacy."
    >
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-foreground">
            <p className="text-muted-foreground">
              Last updated: December 2025
            </p>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">Introduction</h2>
              <p>
                Welcome to Devocrazia. This Privacy Policy explains how I collect, use, and protect 
                your information when you visit this website. I respect your privacy and am committed 
                to protecting any data you share with me.
              </p>
              <p className="mt-4">
                This website is operated by Paolo Regoli, based in the United Kingdom.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">Information I Collect</h2>
              <p>
                This is a personal blog that does not require user registration or login. 
                I may collect the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-4 mt-4">
                <li>
                  <strong>Analytics Data:</strong> This website uses Cloudflare Web Analytics, 
                  which provides privacy-focused, anonymised metrics without using cookies or 
                  tracking individual visitors. Data collected includes page views, referrers, 
                  and general geographic location (country level).
                </li>
                <li>
                  <strong>Contact Information:</strong> If you reach out via the contact form, 
                  I collect your name, email address, and message content solely to respond to 
                  your inquiry. Contact form submissions are processed by FormSubmit.co.
                </li>
                <li>
                  <strong>Comments:</strong> Article comments are powered by Giscus, which uses 
                  GitHub Discussions. To leave a comment, you must log in with a GitHub account. 
                  Your comments and GitHub profile information are stored by GitHub and subject 
                  to their Privacy Policy.
                </li>
                <li>
                  <strong>Technical Data:</strong> Cloudflare may collect standard technical data 
                  including IP addresses, browser type, and device information for security, 
                  performance, and DDoS protection purposes.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">How I Use Your Information</h2>
              <p>Any information collected is used to:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Improve the content and user experience of this website</li>
                <li>Respond to your inquiries or feedback</li>
                <li>Understand general site traffic patterns</li>
                <li>Ensure the security and proper functioning of the website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">Cookies</h2>
              <p>
                This website does not use tracking cookies or advertising cookies. Cloudflare 
                may set essential security cookies (such as <code className="bg-muted px-1 rounded">__cf_bm</code>) 
                to protect against bots and malicious traffic. These are strictly necessary for 
                the website to function securely.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">Third-Party Services</h2>
              <p>This website uses the following third-party services:</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-semibold">Service</th>
                      <th className="text-left py-2 pr-4 font-semibold">Purpose</th>
                      <th className="text-left py-2 font-semibold">Privacy Policy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">Cloudflare</td>
                      <td className="py-2 pr-4">Hosting, CDN, security, analytics</td>
                      <td className="py-2">
                        <a href="https://www.cloudflare.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          cloudflare.com/privacy
                        </a>
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">FormSubmit</td>
                      <td className="py-2 pr-4">Contact form processing</td>
                      <td className="py-2">
                        <a href="https://formsubmit.co/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          formsubmit.co
                        </a>
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">Giscus / GitHub</td>
                      <td className="py-2 pr-4">Article comments</td>
                      <td className="py-2">
                        <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          GitHub Privacy Statement
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">Data Retention</h2>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>
                  <strong>Analytics:</strong> Cloudflare retains anonymised analytics data 
                  according to their data retention policies.
                </li>
                <li>
                  <strong>Contact form:</strong> Submissions are kept only as long as necessary 
                  to address your inquiry, typically no longer than 12 months.
                </li>
                <li>
                  <strong>Comments:</strong> Stored indefinitely by GitHub unless you delete them 
                  from the GitHub Discussion directly.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights</h2>
              <p>
                Under UK GDPR and data protection laws, you have rights regarding your personal data, including:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>The right to access your data</li>
                <li>The right to request correction of your data</li>
                <li>The right to request deletion of your data</li>
                <li>The right to object to processing of your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Policy</h2>
              <p>
                I may update this Privacy Policy from time to time. Any changes will be posted 
                on this page with an updated revision date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">Contact</h2>
              <p>
                If you have any questions about this Privacy Policy, please reach out via 
                the <Link to="/contact" className="text-primary hover:underline">Contact page</Link>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;