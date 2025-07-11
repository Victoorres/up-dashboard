'use client';

import { Linkedin, Instagram, Phone, MapPin, Mail, Calendar, X, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface Professional {
  id: string;
  name: string;
  profession: string;
  description: string;
  phone: string;
  email: string;
  profileImage: string;
  address: {
    state: string;
    city: string;
    district: string;
    street: string;
    complement?: string;
    number: string;
    zipCode: string;
  };
  socialMedia: {
    linkedin?: string;
    instagram?: string;
    whatsapp: string;
  };
  availableDays: {
    dayOfWeek: string;
  }[];
  isActive: boolean;
}

interface ProfessionalProfileModalProps {
  professional: Professional;
  isOpen: boolean;
  onClose: () => void;
}

// Função para formatar os dias disponíveis completos
const formatAvailableDaysFull = (days: { dayOfWeek: string }[]) => {
  if (!days || days.length === 0) return ['Não disponível'];

  const dayMap: Record<string, string> = {
    MONDAY: 'Segunda-feira',
    TUESDAY: 'Terça-feira',
    WEDNESDAY: 'Quarta-feira',
    THURSDAY: 'Quinta-feira',
    FRIDAY: 'Sexta-feira',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo',
  };

  return days.map((day) => dayMap[day.dayOfWeek] || day.dayOfWeek);
};

// Função para formatar endereço completo
const formatFullAddress = (address: Professional['address']) => {
  const { street, number, complement, district, city, state, zipCode } = address;

  const addressParts = [`${street}, ${number}`, complement, district, city, state, zipCode].filter(Boolean);

  return addressParts.join(', ');
};

export function ProfessionalProfileModal({ professional, isOpen, onClose }: ProfessionalProfileModalProps) {
  const { name, profession, description, profileImage, isActive, phone, email, address, availableDays, socialMedia } =
    professional;

  const availableDaysList = formatAvailableDaysFull(availableDays);
  const fullAddress = formatFullAddress(address);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] overflow-y-auto bg-white border-[#511A2B]/20 p-0">
        <div className="sticky top-0 bg-white border-b border-[#511A2B]/10 p-4 md:p-6 z-10">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl md:text-2xl font-bold text-[#511A2B]">Perfil do Profissional</DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5 text-[#511A2B]" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Header do Perfil */}
          <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-20 h-20 md:w-24 md:h-24 rounded-2xl mx-auto md:mx-0">
              <AvatarImage src={profileImage || '/placeholder.svg'} />
              <AvatarFallback className="rounded-2xl bg-[#511A2B] text-white text-xl md:text-2xl">
                {name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-[#511A2B] mb-2">{name}</h2>
              <p className="text-[#FEC460] text-lg font-semibold mb-3">{profession}</p>

              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
                <Badge
                  className={`${
                    isActive
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  } rounded-lg px-3 py-1 mx-auto md:mx-0`}
                >
                  {isActive ? 'Profissional Ativo' : 'Profissional Inativo'}
                </Badge>
              </div>

              {description && <p className="text-[#511A2B]/80 leading-relaxed text-sm md:text-base">{description}</p>}
            </div>
          </div>

          <Separator className="bg-[#511A2B]/10" />

          {/* Informações de Contato */}
          <div>
            <h3 className="text-lg font-semibold text-[#511A2B] mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Informações de Contato
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-[#511A2B]/5 rounded-xl">
                <Phone className="w-5 h-5 text-[#511A2B]/70" />
                <div>
                  <p className="text-sm text-[#511A2B]/70">Telefone</p>
                  <p className="font-medium text-[#511A2B]">{phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-[#511A2B]/5 rounded-xl">
                <Mail className="w-5 h-5 text-[#511A2B]/70" />
                <div>
                  <p className="text-sm text-[#511A2B]/70">E-mail</p>
                  <p className="font-medium text-[#511A2B] break-all">{email}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-[#511A2B]/10" />

          {/* Localização */}
          <div>
            <h3 className="text-lg font-semibold text-[#511A2B] mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Localização
            </h3>

            <div className="p-4 bg-[#511A2B]/5 rounded-xl">
              <p className="text-[#511A2B] leading-relaxed text-sm md:text-base">{fullAddress}</p>
            </div>
          </div>

          <Separator className="bg-[#511A2B]/10" />

          {/* Disponibilidade */}
          <div>
            <h3 className="text-lg font-semibold text-[#511A2B] mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Disponibilidade
            </h3>

            <div className="p-3 bg-[#511A2B]/5 rounded-xl">
              <p className="text-sm text-[#511A2B]/70 mb-2">Dias Disponíveis</p>
              <div className="flex flex-wrap gap-2">
                {availableDaysList.map((day, index) => (
                  <Badge key={index} variant="outline" className="border-[#511A2B]/30 text-[#511A2B] text-xs">
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          {(socialMedia.linkedin || socialMedia.instagram || socialMedia.whatsapp) && (
            <>
              <Separator className="bg-[#511A2B]/10" />
              <div>
                <h3 className="text-lg font-semibold text-[#511A2B] mb-4">Redes Sociais</h3>

                <div className="flex flex-wrap gap-3">
                  {socialMedia.linkedin && (
                    <Button
                      onClick={() => window.open(socialMedia.linkedin, '_blank')}
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                  )}

                  {socialMedia.instagram && (
                    <Button
                      variant="primary"
                      onClick={() => window.open(socialMedia.instagram, '_blank')}
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </Button>
                  )}

                  {socialMedia.whatsapp && (
                    <Button
                      variant="primary"
                      onClick={() => window.open(`https://wa.me/${socialMedia.whatsapp.replace(/\D/g, '')}`, '_blank')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
