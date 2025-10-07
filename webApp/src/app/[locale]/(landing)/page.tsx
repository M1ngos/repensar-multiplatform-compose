"use client"

import React from 'react';
import { useTranslations } from "next-intl";
import {
  Leaf,
  Users,
  BookOpen,
  Target,
  Award,
  TreePine,
  Recycle,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Globe,
  ChevronDown,
  Play,
  Monitor,
  Smartphone,
  Tablet,
  Heart,
  Download
} from 'lucide-react';
import ThreeBackground from "@/components/ui/3d/ThreeBackground";

export default function Page() {
  const t = useTranslations('Landing');

  const programs = [
    {
      title: t('programs.program1.title'),
      description: t('programs.program1.description'),
      icon: <BookOpen className="w-8 h-8" />
    },
    {
      title: t('programs.program2.title'),
      description: t('programs.program2.description'),
      icon: <Recycle className="w-8 h-8" />
    },
    {
      title: t('programs.program3.title'),
      description: t('programs.program3.description'),
      icon: <TreePine className="w-8 h-8" />
    }
  ];

  const stats = [
    { number: t('stats.stat1.number'), label: t('stats.stat1.label'), icon: <Users className="w-6 h-6" /> },
    { number: t('stats.stat2.number'), label: t('stats.stat2.label'), icon: <Target className="w-6 h-6" /> },
    { number: t('stats.stat3.number'), label: t('stats.stat3.label'), icon: <BookOpen className="w-6 h-6" /> },
    { number: t('stats.stat4.number'), label: t('stats.stat4.label'), icon: <Award className="w-6 h-6" /> }
  ];

  const teamMembers = [
    {
      name: t('team.member1.name'),
      role: t('team.member1.role'),
      image: "https://images.pexels.com/photos/3184419/pexels-photo-3184419.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: t('team.member2.name'),
      role: t('team.member2.role'),
      image: "https://images.pexels.com/photos/3184429/pexels-photo-3184429.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: t('team.member3.name'),
      role: t('team.member3.role'),
      image: "https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        <ThreeBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="transform transition-all duration-1000"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-800 dark:text-gray-100 mb-6 leading-tight">
              {t('hero.title')}
              <span className="block text-emerald-500">{t('hero.titleHighlight1')}</span>
              <span className="block text-emerald-400">{t('hero.titleHighlight2')}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                {t('hero.cta1')}
              </button>
              <button className="flex items-center space-x-2 px-8 py-4 border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-semibold rounded-full transition-all duration-300">
                <Play className="w-5 h-5" />
                <span>{t('hero.cta2')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-emerald-500" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="transform hover:scale-105 transition-all duration-500">
              <img
                src="https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Environmental Education"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {t('about.title')} <span className="text-emerald-500">{t('about.titleHighlight')}</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('about.description1')}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('about.description2')}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-full">
                  <Leaf className="w-5 h-5 text-emerald-500" />
                  <span className="text-emerald-800 dark:text-emerald-300 font-medium">{t('about.tags.sustainability')}</span>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-full">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 dark:text-green-300 font-medium">{t('about.tags.community')}</span>
                </div>
                <div className="flex items-center space-x-2 bg-teal-50 dark:bg-teal-900/30 px-4 py-2 rounded-full">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                  <span className="text-teal-800 dark:text-teal-300 font-medium">{t('about.tags.education')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('programs.title')} <span className="text-emerald-500">{t('programs.titleHighlight')}</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('programs.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 group"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                <div className="mb-6 text-emerald-500 transform group-hover:scale-110 transition-transform duration-300">
                  {program.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{program.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{program.description}</p>
                <button className="mt-6 text-emerald-500 hover:text-emerald-400 font-semibold transition-colors duration-300">
                  {t('programs.learnMore')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('stats.title')}</h2>
            <p className="text-xl text-emerald-200">{t('stats.subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group transform hover:scale-110 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-emerald-700 hover:bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-emerald-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer Section */}
      <section id="volunteer" className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('volunteer.title')} <span className="text-emerald-500">{t('volunteer.titleHighlight')}</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('volunteer.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 group text-center">
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300 flex justify-center">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">
                  <Monitor className="w-12 h-12 text-emerald-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('volunteer.desktop.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {t('volunteer.desktop.description')}
              </p>
              <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto">
                <Download className="w-5 h-5" />
                <span>{t('volunteer.desktop.cta')}</span>
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 group text-center">
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300 flex justify-center">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">
                  <Smartphone className="w-12 h-12 text-emerald-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('volunteer.android.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {t('volunteer.android.description')}
              </p>
              <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto">
                <Download className="w-5 h-5" />
                <span>{t('volunteer.android.cta')}</span>
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 group text-center">
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300 flex justify-center">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">
                  <Tablet className="w-12 h-12 text-emerald-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('volunteer.ios.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {t('volunteer.ios.description')}
              </p>
              <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto">
                <Download className="w-5 h-5" />
                <span>{t('volunteer.ios.cta')}</span>
              </button>
            </div>
          </div>

          <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">
                <Heart className="w-12 h-12 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('volunteer.whyVolunteer.title')}</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
              {t('volunteer.whyVolunteer.description')}
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-500 mb-2">{t('volunteer.whyVolunteer.stat1.number')}</div>
                <div className="text-gray-600 dark:text-gray-300">{t('volunteer.whyVolunteer.stat1.label')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-500 mb-2">{t('volunteer.whyVolunteer.stat2.number')}</div>
                <div className="text-gray-600 dark:text-gray-300">{t('volunteer.whyVolunteer.stat2.label')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-500 mb-2">{t('volunteer.whyVolunteer.stat3.number')}</div>
                <div className="text-gray-600 dark:text-gray-300">{t('volunteer.whyVolunteer.stat3.label')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('team.title')} <span className="text-emerald-500">{t('team.titleHighlight')}</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('team.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500"
                style={{
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-emerald-200">{member.role}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors duration-300">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{member.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('contact.title')} <span className="text-emerald-500">{t('contact.titleHighlight')}</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="flex items-start space-x-4 group">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full transition-colors duration-300">
                  <MapPin className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('contact.address.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300" style={{whiteSpace: 'pre-line'}}>{t('contact.address.text')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full transition-colors duration-300">
                  <Phone className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('contact.phone.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('contact.phone.text')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full transition-colors duration-300">
                  <Mail className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('contact.email.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('contact.email.text')}</p>
                </div>
              </div>

              <div className="pt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('contact.social')}</h3>
                <div className="flex space-x-4">
                  <a href="#" className="p-3 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full transition-colors duration-300 transform hover:scale-110">
                    <Facebook className="w-6 h-6 text-emerald-500" />
                  </a>
                  <a href="#" className="p-3 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full transition-colors duration-300 transform hover:scale-110">
                    <Instagram className="w-6 h-6 text-emerald-500" />
                  </a>
                  <a href="#" className="p-3 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full transition-colors duration-300 transform hover:scale-110">
                    <Globe className="w-6 h-6 text-emerald-500" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.form.name')}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder={t('contact.form.namePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.form.email')}</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder={t('contact.form.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.form.message')}</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder={t('contact.form.messagePlaceholder')}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {t('contact.form.submit')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Leaf className="w-8 h-8 text-emerald-400" />
                <span className="text-2xl font-bold">Repensar</span>
              </div>
              <p className="text-emerald-200 leading-relaxed max-w-md">
                {t('footer.description')}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.usefulLinks')}</h3>
              <ul className="space-y-2 text-emerald-200">
                <li><a href="#home" className="hover:text-white transition-colors duration-300">{t('footer.links.home')}</a></li>
                <li><a href="#about" className="hover:text-white transition-colors duration-300">{t('footer.links.about')}</a></li>
                <li><a href="#programs" className="hover:text-white transition-colors duration-300">{t('footer.links.programs')}</a></li>
                <li><a href="#volunteer" className="hover:text-white transition-colors duration-300">{t('footer.links.volunteer')}</a></li>
                <li><a href="#team" className="hover:text-white transition-colors duration-300">{t('footer.links.team')}</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.contact')}</h3>
              <div className="space-y-2 text-emerald-200">
                <p>{t('contact.email.text')}</p>
                <p>{t('contact.phone.text')}</p>
                <p>São Paulo, SP</p>
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-700 mt-8 pt-8 text-center text-emerald-200">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}