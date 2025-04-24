import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
    <div className="space-y-6">
      <h1 className="text-2xl font-heading">Allocate Funds</h1>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search beneficiaries by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </Card>
          ))
        ) : filteredBeneficiaries.length > 0 ? (
          filteredBeneficiaries.map((beneficiary) => (
            <Card key={beneficiary.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{beneficiary.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {beneficiary.idNumber}</p>
                  <p className="text-sm mt-1">Region: {beneficiary.region}</p>
                </div>
                <Button onClick={() => {/* Handle allocation */}}>
                  Allocate
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No beneficiaries found
          </div>
        )}
      </div>
    </div>
  );
} 