import { CheckCircle } from 'lucide-react';

function FeaturesSection() {
  const features = [
    {
      title: 'Easy Integration',
      description: 'Seamlessly integrates with your existing systems and workflows.',
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Powerful Analytics',
      description: 'Gain valuable insights with our advanced analytics dashboard.',
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Secure Platform',
      description: 'Enterprise-grade security to protect your sensitive data.',
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
    },
    {
      title: '24/7 Support',
      description: 'Our dedicated team is always available to help you succeed.',
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
    },
  ];

  return (
    <section id="features" className="bg-muted py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Features That Make Us Stand Out
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              Our comprehensive set of features is designed to help your business thrive in
              today&apos;s competitive landscape.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-start gap-2 rounded-lg bg-background p-6 shadow-sm"
            >
              {feature.icon}
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
