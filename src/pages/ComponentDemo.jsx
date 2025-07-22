import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  Input, 
  Select, 
  Avatar, 
  Badge, 
  Alert, 
  Modal,
  Tabs,
  Toast,
  Skeleton,
  SkeletonText,
  Stat
} from '../components/ui';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {
  FiUser,
  FiHeart,
  FiActivity,
  FiCalendar,
  FiInfo,
  FiAlertTriangle,
  FiX,
  FiCheck,
  FiPlus,
  FiSettings,
  FiDollarSign,
  FiArrowUp,
  FiArrowDown
} = FiIcons;

/**
 * Component to showcase all the UI components
 */
const ComponentDemo = () => {
  // State for interactive components
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Options for select component
  const selectOptions = [
    { value: 'dog', label: 'Dog' },
    { value: 'cat', label: 'Cat' },
    { value: 'bird', label: 'Bird' },
    { value: 'rabbit', label: 'Rabbit' },
    { value: 'other', label: 'Other' },
  ];
  
  // Tabs content
  const tabsContent = [
    {
      label: 'Dashboard',
      icon: FiActivity,
      content: <div className="p-4 bg-gray-50 rounded-lg">Dashboard Content</div>
    },
    {
      label: 'Profile',
      icon: FiUser,
      content: <div className="p-4 bg-gray-50 rounded-lg">Profile Content</div>
    },
    {
      label: 'Settings',
      icon: FiSettings,
      content: <div className="p-4 bg-gray-50 rounded-lg">Settings Content</div>
    }
  ];
  
  // Simulate loading
  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">PetVue UI Components</h1>
      
      {/* Buttons Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Variants</h3>
              <div className="space-y-3">
                <Button variant="primary" className="w-full">Primary Button</Button>
                <Button variant="secondary" className="w-full">Secondary Button</Button>
                <Button variant="outline" className="w-full">Outline Button</Button>
                <Button variant="ghost" className="w-full">Ghost Button</Button>
                <Button variant="danger" className="w-full">Danger Button</Button>
                <Button variant="success" className="w-full">Success Button</Button>
                <Button variant="accent" className="w-full">Accent Button</Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Sizes</h3>
              <div className="space-y-3">
                <Button size="sm">Small Button</Button>
                <Button size="md">Medium Button</Button>
                <Button size="lg">Large Button</Button>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-3">States</h3>
              <div className="space-y-3">
                <Button loading>Loading Button</Button>
                <Button disabled>Disabled Button</Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">With Icons</h3>
              <div className="space-y-3">
                <Button icon={FiPlus}>Add New</Button>
                <Button icon={FiSettings} variant="outline">Settings</Button>
                <Button icon={FiHeart} iconPosition="right" variant="secondary">Favorite</Button>
                <Button icon={FiX} variant="danger" size="sm">Remove</Button>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-3">Full Width</h3>
              <Button fullWidth icon={FiCalendar}>Schedule Appointment</Button>
            </div>
          </div>
        </Card>
      </section>
      
      {/* Form Controls Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Form Controls</h2>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Input</h3>
              <Input
                label="Pet Name"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter pet name"
                helpText="Enter your pet's full name"
              />
              
              <Input
                label="Email Address"
                type="email"
                placeholder="example@mail.com"
                icon={FiUser}
                required
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                error="Password must be at least 8 characters"
              />
              
              <Input
                label="Confirmation Code"
                placeholder="Enter code"
                success="Code verified!"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Select</h3>
              <Select
                label="Pet Type"
                options={selectOptions}
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                placeholder="Choose pet type"
                helpText="Select the type of pet you have"
              />
              
              <Select
                label="Breed"
                options={['Labrador', 'Golden Retriever', 'German Shepherd', 'Bulldog', 'Poodle']}
                placeholder="Select breed"
                error="Please select a breed"
              />
              
              <Select
                label="Age"
                options={[
                  { value: 'puppy', label: 'Puppy (0-1 years)' },
                  { value: 'young', label: 'Young Adult (1-3 years)' },
                  { value: 'adult', label: 'Adult (3-8 years)' },
                  { value: 'senior', label: 'Senior (8+ years)' },
                ]}
                placeholder="Select age group"
                disabled
              />
            </div>
          </div>
        </Card>
      </section>
      
      {/* Display Components Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Display Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-3">Avatar</h3>
            <div className="flex flex-wrap gap-4">
              <Avatar size="xs" name="Max" />
              <Avatar size="sm" name="Bella" />
              <Avatar size="md" name="Charlie" />
              <Avatar size="lg" name="Lucy" />
              <Avatar size="xl" name="Cooper" />
              <Avatar size="2xl" name="Daisy" />
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <Avatar src="https://images.unsplash.com/photo-1517849845537-4d257902454a" alt="Dog" />
              <Avatar icon={FiUser} />
              <Avatar name="Oliver" variant="square" />
              <Avatar name="Milo" status="online" />
              <Avatar name="Luna" status="busy" />
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-3">Badge</h3>
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge icon={FiHeart}>With Icon</Badge>
              <Badge removable onRemove={() => console.log('Removed')}>Removable</Badge>
              <Badge variant="primary" icon={FiCheck}>Completed</Badge>
              <Badge variant="warning" icon={FiAlertTriangle}>Warning</Badge>
            </div>
          </Card>
        </div>
      </section>
      
      {/* Cards & Stats Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Cards & Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-3">Basic Card</h3>
            <p className="text-gray-600 mb-4">
              This is a basic card component that can contain any content.
            </p>
            <Button variant="outline" size="sm">Learn More</Button>
          </Card>
          
          <Card variant="primary" className="p-6">
            <h3 className="text-lg font-medium mb-3">Primary Card</h3>
            <p className="text-gray-600 mb-4">
              This card has a primary variant styling.
            </p>
            <Button variant="primary" size="sm">View Details</Button>
          </Card>
          
          <Card interactive onClick={() => alert('Card clicked!')} className="p-6">
            <h3 className="text-lg font-medium mb-3">Interactive Card</h3>
            <p className="text-gray-600">
              This card is interactive and can be clicked.
            </p>
          </Card>
          
          <Stat 
            title="Total Pets" 
            value="12" 
            icon={FiHeart}
            variant="primary"
          />
          
          <Stat 
            title="Monthly Cost" 
            value="$245.50" 
            icon={FiDollarSign}
            trend="up"
            trendValue="12% from last month"
            variant="success"
          />
          
          <Stat 
            title="Appointments" 
            value="5" 
            description="Next: Tomorrow at 3:00 PM"
            icon={FiCalendar}
            trend="down"
            trendValue="2 less than last month"
            variant="warning"
          />
        </div>
      </section>
      
      {/* Alerts Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Alerts</h2>
        <div className="space-y-4">
          <Alert title="Information" variant="info">
            This is an informational alert to provide guidance.
          </Alert>
          
          <Alert title="Success" variant="success">
            Your changes have been saved successfully.
          </Alert>
          
          <Alert title="Warning" variant="warning">
            This action might have consequences.
          </Alert>
          
          <Alert title="Error" variant="error">
            There was a problem processing your request.
          </Alert>
          
          <Alert title="Dismissible Alert" variant="neutral" dismissible onDismiss={() => console.log('Alert dismissed')}>
            You can dismiss this alert by clicking the X button.
          </Alert>
        </div>
      </section>
      
      {/* Tabs Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Tabs</h2>
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-3">Default Tabs</h3>
          <Tabs tabs={tabsContent} />
          
          <h3 className="text-lg font-medium mt-8 mb-3">Pills Variant</h3>
          <Tabs tabs={tabsContent} variant="pills" />
          
          <h3 className="text-lg font-medium mt-8 mb-3">Boxed Variant</h3>
          <Tabs tabs={tabsContent} variant="boxed" />
        </Card>
      </section>
      
      {/* Loading States Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Loading States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-3">Skeleton Loaders</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton variant="avatar" />
                <div className="flex-1">
                  <Skeleton variant="text" className="w-1/2 mb-2" />
                  <Skeleton variant="text" className="w-3/4" />
                </div>
              </div>
              
              <SkeletonText lines={3} />
              
              <div className="grid grid-cols-3 gap-4">
                <Skeleton variant="card" className="h-24" />
                <Skeleton variant="card" className="h-24" />
                <Skeleton variant="card" className="h-24" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-3">Loading Buttons</h3>
            <div className="space-y-4">
              <Button loading={loading} onClick={handleLoadingClick} fullWidth>
                {loading ? 'Loading...' : 'Click to Load'}
              </Button>
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="primary" loading={loading}>
                  Primary
                </Button>
                <Button variant="secondary" loading={loading}>
                  Secondary
                </Button>
                <Button variant="outline" loading={loading}>
                  Outline
                </Button>
                <Button variant="ghost" loading={loading}>
                  Ghost
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
      
      {/* Interactive Components Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Interactive Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-3">Modal Dialog</h3>
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Modal Title"
              footer={
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                    Confirm
                  </Button>
                </div>
              }
            >
              <div className="space-y-4">
                <p>This is an example modal with customizable content.</p>
                <p>You can add any content here, including forms, images, or other components.</p>
              </div>
            </Modal>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-3">Toast Notifications</h3>
            <div className="space-y-3">
              <Button onClick={() => setShowToast(true)}>Show Toast</Button>
              
              {showToast && (
                <Toast
                  id="demo-toast"
                  title="Toast Notification"
                  message="This is an example toast notification"
                  type="success"
                  onClose={() => setShowToast(false)}
                  action={
                    <Button variant="outline" size="sm">
                      Action
                    </Button>
                  }
                />
              )}
            </div>
            
            <div className="mt-6 space-y-3">
              <Toast
                title="Success Toast"
                message="Operation completed successfully"
                type="success"
              />
              
              <Toast
                title="Error Toast"
                message="An error occurred during the operation"
                type="error"
              />
              
              <Toast
                title="Warning Toast"
                message="This action might have consequences"
                type="warning"
              />
              
              <Toast
                title="Info Toast"
                message="Here's some information you might find useful"
                type="info"
              />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ComponentDemo;