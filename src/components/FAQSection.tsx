import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Какво е натална карта?",
    answer: "Наталната карта е астрологична схема, която показва позициите на Слънцето, Луната и планетите в момента на вашето раждане. Тя служи като вашата космическа ДНК и разкрива вашите вродени таланти, предизвикателства и жизнен път."
  },
  {
    question: "Колко точни са хороскопите?",
    answer: "Нашите хороскопи се базират на Swiss Ephemeris - една от най-точните астрономически библиотеки в света. Персонализираните прогнози отчитат вашата уникална натална карта за максимална релевантност."
  },
  {
    question: "Трябва ли да знам точния час на раждане?",
    answer: "Точният час на раждане е важен за пълен анализ, особено за изчисляване на Асцендента. Ако не го знаете, все още можем да генерираме основна карта, но някои детайли ще бъдат по-малко прецизни."
  },
  {
    question: "Какво включва анализът за съвместимост?",
    answer: "Анализът за съвместимост сравнява двете натални карти и оценява хармонията между планетите. Получавате детайлен доклад за силните страни на връзката, потенциални предизвикателства и съвети за хармония."
  },
  {
    question: "Мога ли да използвам услугите безплатно?",
    answer: "Да! Предлагаме безплатни дневни, седмични и месечни хороскопи, както и достъп до лунния календар. За по-детайлни анализи като пълна натална карта или съвместимост, предлагаме различни платени планове."
  },
  {
    question: "Как да се свържа с поддръжката?",
    answer: "Можете да ни пишете на support@eclyptica.com или да използвате формата за контакт в секция 'За нас'. Отговаряме в рамките на 24-48 часа."
  }
];

export const FAQSection = () => {
  return (
    <section 
      className="py-16 sm:py-24 px-4 bg-background"
      aria-labelledby="faq-heading"
    >
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12 space-y-4">
          <h2 
            id="faq-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
          >
            Често Задавани Въпроси
          </h2>
          <p className="text-lg text-muted-foreground">
            Отговори на най-често задаваните въпроси за нашите услуги
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg px-6 data-[state=open]:border-primary/50"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
                <span className="font-medium text-base sm:text-lg">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
