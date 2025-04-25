import { useState, useEffect } from 'react';
import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface Beneficiary {
  id: string;
  name: string;
  idNumber: string;
  region: string;
}

export function AllocatePage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { isMobile } = useIsMobile();

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/beneficiaries');
      const data = await response.json();
      setBeneficiaries(data);
    } catch (error) {
      toast.error('Failed to fetch beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  const filteredBeneficiaries = beneficiaries.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.idNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-4 py-2 md:py-4 min-h-[calc(100vh-9rem)]">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-heading">Allocate Funds</h1>
        
        {isMobile && (
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search beneficiaries by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 py-2 h-auto text-sm md:text-base"
        />
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-[300px]">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-3 md:p-4 animate-pulse">
                <div className="h-3 md:h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 md:h-4 bg-muted rounded w-1/2" />
              </Card>
            ))
          ) : filteredBeneficiaries.length > 0 ? (
            filteredBeneficiaries.map((beneficiary) => (
              <Card key={beneficiary.id} className="p-3 md:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="font-medium text-sm md:text-base truncate">{beneficiary.name}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">ID: {beneficiary.idNumber}</p>
                    <p className="text-xs md:text-sm mt-1 text-gray-600 truncate">Region: {beneficiary.region}</p>
                  </div>
                  <Button 
                    onClick={() => {/* Handle allocation */}}
                    className="text-xs md:text-sm py-1 px-2 md:py-1.5 md:px-3 h-auto"
                  >
                    Allocate
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground text-sm md:text-base">
              No beneficiaries found
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 