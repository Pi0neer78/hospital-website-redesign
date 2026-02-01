import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DoctorSelectorProps {
  doctors: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectDoctor: (doctor: any) => void;
  selectedDoctorId?: number;
  onOpenPhoto?: (url: string) => void;
}

const DoctorSelector = ({ 
  doctors, 
  searchQuery, 
  setSearchQuery, 
  onSelectDoctor, 
  selectedDoctorId,
  onOpenPhoto 
}: DoctorSelectorProps) => {
  const filteredDoctors = doctors.filter((doctor: any) => 
    searchQuery === '' || 
    doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Врачи</h2>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Поиск врача по ФИО..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[250px] h-9"
            />
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="h-9"
              >
                <Icon name="X" size={14} />
              </Button>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredDoctors.map((doctor: any) => (
            <Card 
              key={doctor.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedDoctorId === doctor.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => {
                onSelectDoctor(doctor);
                setSearchQuery(doctor.full_name);
                setTimeout(() => {
                  const dateSection = document.getElementById('available-dates-section');
                  if (dateSection) {
                    dateSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {doctor.photo_url ? (
                    <img 
                      src={doctor.photo_url} 
                      alt={doctor.full_name} 
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenPhoto) onOpenPhoto(doctor.photo_url);
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={40} className="text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-semibold text-sm">{doctor.full_name}</p>
                    <p className="text-xs font-bold text-blue-900">{doctor.position}</p>
                    {doctor.specialization && (
                      <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                    )}
                    {doctor.phone && (
                      <p className="text-xs flex items-center gap-1 font-bold text-blue-900">
                        <Icon name="Phone" size={12} className="text-blue-900" />
                        <span>{doctor.phone}</span>
                      </p>
                    )}
                    <div className="pt-1 space-y-0.5">
                      {doctor.office_number && (
                        <p className="text-xs flex items-center gap-1">
                          <Icon name="DoorOpen" size={12} className="text-primary" />
                          <span className="font-medium">Кабинет {doctor.office_number}</span>
                        </p>
                      )}
                      {doctor.work_experience && (
                        <p className="text-xs flex items-center gap-1">
                          <Icon name="Briefcase" size={12} className="text-primary" />
                          <span>Стаж {doctor.work_experience} лет</span>
                        </p>
                      )}
                      {doctor.education && (
                        <p className="text-xs flex items-center gap-1">
                          <Icon name="GraduationCap" size={12} className="text-primary" />
                          <span className="truncate" title={doctor.education}>{doctor.education}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorSelector;
