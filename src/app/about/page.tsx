
import Image from 'next/image';
import { Building, Target, Users, CheckCircle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const teamMembers = [
  { name: 'Alice Johnson', role: 'Founder & CEO', imageId: 'team-member-1' },
  { name: 'Ben Carter', role: 'Head of Production', imageId: 'team-member-2' },
  { name: 'Cathy Davis', role: 'Lead Designer', imageId: 'team-member-3' },
  { name: 'David Evans', role: 'Marketing Director', imageId: 'team-member-4' },
];

function findImage(id: string) {
    return PlaceHolderImages.find((img) => img.id === id);
}

export default function AboutPage() {
  const aboutImage = findImage('about-us-banner');
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-primary text-primary-foreground flex items-center justify-center">
        {aboutImage && (
            <Image
                src={aboutImage.imageUrl}
                alt="Our Team"
                fill
                sizes="100vw"
                className="object-cover opacity-20"
                data-ai-hint={aboutImage.imageHint}
            />
        )}
        <div className="container mx-auto max-w-7xl px-4 text-center z-10">
          <h1 className="text-4xl md:text-5xl font-bold font-heading">About BOMedia</h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">
            Your trusted partner for high-quality, fast, and affordable custom printing solutions.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-heading mb-4 text-primary flex items-center">
                <Building className="mr-3 h-8 w-8" />
                Our Story
              </h2>
              <p className="text-muted-foreground mb-4">
                Founded in 2023 in the bustling heart of Lagos, Nigeria, BOMedia started with a simple mission: to make high-quality custom printing accessible and hassle-free for businesses of all sizes. We saw the challenges many companies faced—long turnaround times, inconsistent quality, and high costs—and we knew there was a better way.
              </p>
              <p className="text-muted-foreground">
                By combining cutting-edge printing technology with a customer-centric approach, we've grown into a leading provider of custom branding materials. From startups to established enterprises, we empower our clients to bring their brand vision to life with speed and precision.
              </p>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Target className="mr-3 h-6 w-6 text-accent"/>
                            Our Mission
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-medium mb-4">To empower businesses to create a lasting impression through affordable, high-quality, and rapidly delivered custom-branded products.</p>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <CheckCircle className="h-5 w-5 mr-3 mt-1 text-accent shrink-0"/>
                                <span className="text-muted-foreground">To provide a seamless and user-friendly online ordering experience.</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="h-5 w-5 mr-3 mt-1 text-accent shrink-0"/>
                                <span className="text-muted-foreground">To maintain the highest standards of quality in every product we print.</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="h-5 w-5 mr-3 mt-1 text-accent shrink-0"/>
                                <span className="text-muted-foreground">To offer exceptional customer service and support throughout the entire process.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading flex items-center justify-center">
              <Users className="mr-3 h-8 w-8" />
              Meet the Team
            </h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              The passionate individuals dedicated to making your brand shine.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => {
                const image = findImage(member.imageId);
                return (
                    <div key={member.name} className="text-center">
                        <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary">
                            {image && <AvatarImage src={image.imageUrl} alt={member.name} />}
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-semibold">{member.name}</h3>
                        <p className="text-accent font-medium">{member.role}</p>
                    </div>
                );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
