import Layout from "@/components/Layout";
import SocialLinks from "@/components/SocialLinks";
import authorAvatar from "@/assets/author-avatar.jpg";

const About = () => {
  return (
    <Layout
      title="About"
      description="Learn about Paolo Regoli - Senior Software Engineer & Cloud Architect with almost twenty years of experience building software across Europe and Australia."
    >
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Portrait Image */}
            <div className="w-full md:w-80 flex-shrink-0 flex justify-center md:justify-start">
              <img
                src={authorAvatar}
                alt="Paolo Regoli - Senior Software Engineer"
                className="w-40 h-40 md:w-80 md:h-auto object-cover rounded-full md:rounded-md shadow-md"
              />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-8">
              <div>
                <h1 className="text-5xl font-bold text-foreground mb-3">Paolo Regoli</h1>
                <h2 className="text-2xl text-primary font-medium">
                  Senior Software Engineer & Cloud Architect
                </h2>
              </div>

              <div className="space-y-4 text-foreground leading-relaxed">
                <p>
                  I'm a Software Engineer with almost twenty years of experience building
                  software across Europe and Australia. My career started in Italy and took
                  me to Sydney, Berlin, and now London, giving me the chance to work in
                  diverse engineering cultures and on a wide range of problem domains. I
                  specialise in designing and developing modern applications using .NET, C#,
                  TypeScript, and cloud technologies, with a strong focus on clarity,
                  maintainability, and real-world domain modelling.
                </p>

                <p>
                  Much of my work has been centred around software architecture, particularly
                  Domain-Driven Design, event-driven systems, asynchronous workflows,
                  messaging patterns, and clean, modular application boundaries. I've worked
                  extensively on distributed systems, financial platforms, enterprise SaaS
                  products, and integrations between complex services. I enjoy taking
                  intricate business domains and turning them into software that is
                  expressive, understandable, and built to evolve over time rather than
                  degrade.
                </p>

                <p>
                  Outside of my day-to-day work, I'm constantly exploring new architectural
                  techniques, experimenting with modern tooling, and refining the principles
                  that help developers build better systems. This blog is where I document
                  what I learn along the way, whether it's about software architecture,
                  patterns, DDD, testing, cloud-native approaches, or the practical lessons
                  gained from building and maintaining real production systems across
                  multiple countries and teams.
                </p>
              </div>

              {/* Connect Section */}
              <div className="pt-4">
                <h3 className="text-2xl font-bold text-foreground mb-6">Connect with Me</h3>
                <SocialLinks />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
