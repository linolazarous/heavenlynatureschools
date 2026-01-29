import React, { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/contact", formData);

      toast.success("Thank you for contacting us! We'll get back to you soon.");

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We'd love to hear from you. Get in touch with our team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* FORM */}
            <div>
              <h2 className="font-serif text-3xl font-semibold text-primary mb-8">
                Send Us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {[
                  { label: "Full Name", name: "name", type: "text", required: true },
                  { label: "Email Address", name: "email", type: "email", required: true },
                  { label: "Phone Number", name: "phone", type: "tel" },
                  { label: "Subject", name: "subject", type: "text", required: true },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-primary mb-2">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      required={field.required}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows="6"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white rounded-full px-8 py-4 text-lg font-medium hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            {/* CONTACT INFO */}
            <div>
              <h2 className="font-serif text-3xl font-semibold text-primary mb-8">
                Contact Information
              </h2>

              <div className="space-y-8">
                <InfoItem
                  icon={<MapPin size={28} />}
                  title="Our Location"
                  text="Juba City, Central Equatoria State, South Sudan"
                />

                <InfoItem
                  icon={<Phone size={28} />}
                  title="Phone"
                  text="+211 922 273 334"
                  link="tel:+211922273334"
                />

                <InfoItem
                  icon={<Mail size={28} />}
                  title="Email"
                  text="info@heavenlynatureschools.com"
                  link="mailto:info@heavenlynatureschools.com"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const InfoItem = ({ icon, title, text, link }) => (
  <div className="flex items-start space-x-4">
    <div className="text-secondary mt-1">{icon}</div>
    <div>
      <h3 className="font-semibold text-primary text-lg mb-2">{title}</h3>
      {link ? (
        <a href={link} className="text-muted-foreground hover:text-primary">
          {text}
        </a>
      ) : (
        <p className="text-muted-foreground">{text}</p>
      )}
    </div>
  </div>
);

export default Contact;
