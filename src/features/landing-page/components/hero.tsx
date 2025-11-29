import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

function HeroSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Transform Your Business with Our Solution
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Our platform helps businesses streamline operations, increase efficiency, and drive
                growth.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="gap-1">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/placeholder.svg?height=550&width=550"
              alt="Hero"
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
