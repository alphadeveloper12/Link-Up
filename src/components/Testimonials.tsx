import React from 'react';
import { Star } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO, TechStart",
      avatar: "SC",
      content: "LinkUp helped us scale our development team in 24 hours. The quality is incredible!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "VP Engineering, Fortune 500",
      avatar: "MJ",
      content: "From concept to deployment in record time. Our rocket team delivered beyond expectations.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Founder, GrowthCo",
      avatar: "ER",
      content: "The compliance features saved us weeks of legal work. Truly enterprise-grade.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of companies scaling with LinkUp
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;