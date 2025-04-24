import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Disburser, Region, REGIONS } from '@/types/disburser';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export function DisburserManagement() {
  const [disbursers, setDisbursers] = useState<Disburser[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisburser, setSelectedDisburser] = useState<Disburser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    region: '' as Region,
  });

  useEffect(() => {
    fetchDisbursers();
  }, []);

  const fetchDisbursers = async () => {
    try {
      // Replace with your actual API call
      const response = await fetch('/api/disbursers');
      const data = await response.json();
      setDisbursers(data);
    } catch (error) {
      toast.error('Failed to fetch disbursers');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedDisburser 
        ? `/api/disbursers/${selectedDisburser.id}`
        : '/api/disbursers';
      
      const method = selectedDisburser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save disburser');
      
      toast.success(`Disburser ${selectedDisburser ? 'updated' : 'created'} successfully`);
      setIsDialogOpen(false);
      fetchDisbursers();
    } catch (error) {
      toast.error('Failed to save disburser');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this disburser?')) return;
    
    try {
      const response = await fetch(`/api/disbursers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete disburser');
      
      toast.success('Disburser deleted successfully');
      fetchDisbursers();
    } catch (error) {
      toast.error('Failed to delete disburser');
    }
  };

  const filteredDisbursers = disbursers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading">Manage Disbursers</h2>
        <Button
          onClick={() => {
            setSelectedDisburser(null);
            setFormData({ name: '', email: '', region: '' as Region });
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Disburser
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search disbursers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDisbursers.map((disburser) => (
          <Card key={disburser.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{disburser.name}</h3>
                <p className="text-sm text-muted-foreground">{disburser.email}</p>
                <p className="text-sm mt-1">Region: {disburser.region}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedDisburser(disburser);
                    setFormData({
                      name: disburser.name,
                      email: disburser.email,
                      region: disburser.region as Region,
                    });
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(disburser.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDisburser ? 'Edit Disburser' : 'Add New Disburser'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Region</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value as Region })}
                className="input"
                required
              >
                <option value="">Select a region</option>
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedDisburser ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 