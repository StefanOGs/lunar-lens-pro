import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Eclyptica Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold">Eclyptica</span>
          </Link>
          
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Начало
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="w-20 h-20 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">За нас</h1>
            <p className="text-xl text-muted-foreground">
              Вашият надежден партньор в астрологичното пътешествие
            </p>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Нашата мисия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Ние сме екип, посветен на създаването на персонализирани астрологични анализи и хороскопи, 
                вдъхновени от науката и духовността. Нашата мисия е да помогнем на всеки човек да опознае 
                по-добре себе си чрез силата на звездите.
              </p>
              <p>
                В Eclyptica вярваме, че всеки от нас носи уникална космическа карта, която разкрива 
                нашите силни страни, предизвикателства и пътища към личностно развитие. Чрез съвременни 
                технологии и древни астрологични знания, ние предлагаме точни и задълбочени анализи, 
                които ви помагат да разберете по-добре себе си и света около вас.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Нашите ценности</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Точност и професионализъм</h3>
                    <p className="text-muted-foreground">
                      Всеки хороскоп и анализ е създаден с внимание към детайла и професионална експертиза.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Персонализиран подход</h3>
                    <p className="text-muted-foreground">
                      Разбираме, че всеки човек е уникален и заслужава индивидуален астрологичен анализ.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Достъпност и иновации</h3>
                    <p className="text-muted-foreground">
                      Използваме съвременни технологии, за да направим астрологията достъпна за всеки.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center pt-8">
            <Button size="lg" asChild>
              <Link to="/dashboard">
                Започнете вашето пътешествие
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
