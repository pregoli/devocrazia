import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="aspect-video rounded-2xl bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <div className="text-white text-6xl font-bold">JS</div>
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            JavaScript
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Mastering Asynchronous JavaScript
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore the core concepts of asynchronous programming in JavaScript, from callbacks to
            async/await, and level up your coding skills.
          </p>
          <Button className="mt-4">Read More</Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
