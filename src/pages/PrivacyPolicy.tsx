import Layout from "@/components/Layout";

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
              Last updated: November 2025
            </p>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">Introduction</h2>
              <p>
                Welcome to Devocrazia. This Privacy Policy explains how I collect, use, and protect 
                your information when you visit this website. I respect your privacy and am committed 
                to protecting any data you share with me.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">Information I Collect</h2>
              <p>
                This is a personal blog that does not require user registration or login. 
                I may collect the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>
                  <strong>Analytics Data:</strong> Anonymous usage data such as pages visited, 
                  time spent on site, and general geographic location (country/city level) 
                  to understand how visitors use the site.
                </li>
                <li>
                  <strong>Contact Information:</strong> If you reach out via the contact form, 
                  I collect your name, email address, and message content solely to respond to your inquiry.
                </li>
                <li>
                  <strong>Technical Data:</strong> Standard server logs including IP addresses, 
                  browser type, and device information for security and performance purposes.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">How I Use Your Information</h2>
              <p>Any information collected is used to:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Improve the content and user experience of this website</li>
                <li>Respond to your inquiries or feedback</li>
                <li>Analyse site traffic and usage patterns</li>
                <li>Ensure the security and proper functioning of the website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">Cookies</h2>
              <p>
                This website may use cookies for essential functionality and analytics. 
                Cookies are small text files stored on your device. You can control cookie 
                settings through your browser preferences. Disabling cookies may affect 
                some site functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">Third-Party Services</h2>
              <p>
                This website may use third-party services such as:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>
                  <strong>Hosting Provider:</strong> For serving the website content
                </li>
                <li>
                  <strong>Analytics:</strong> To understand site usage (e.g., Google Analytics or similar)
                </li>
              </ul>
              <p className="mt-4">
                These services may collect their own data subject to their respective privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">Data Retention</h2>
              <p>
                Analytics data is retained for a reasonable period to identify trends. 
                Contact form submissions are kept only as long as necessary to address your inquiry, 
                after which they are deleted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights</h2>
              <p>
                Depending on your location, you may have rights regarding your personal data, including:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>The right to access your data</li>
                <li>The right to request deletion of your data</li>
                <li>The right to opt out of analytics tracking</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact me using the details below.
              </p>
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
                the <a href="/contact" className="text-primary hover:underline">Contact page</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
