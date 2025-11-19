import React, { useState, useEffect } from 'react';
import { Users, Plus, UserCheck, Clock } from 'lucide-react';
import EmployeeTable from './onboarding/ProbationaryEmployeesTable';
import EmployeeDetailsView from './onboarding/EmployeeDetailsView';
import EmployeeModal from './onboarding/EmployeeModal';
import { EmployeeMasterAPI } from '../../api/employeeMaster';

const ProbationaryEmployees = () => { 
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('table'); // 'table', 'details', 'edit'
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // ✅ Fetch employees from API
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await EmployeeMasterAPI.getAll();
      if (response?.success && Array.isArray(response.result)) {
        setEmployees(response.result);
      } else {
        console.error('Unexpected API response:', response);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle view details - store employee ID and switch view
  const handleViewEmployee = (employeeId) => {
    console.log('=== ONBOARDING - HANDLE VIEW EMPLOYEE ===');
    console.log('Received employeeId:', employeeId);
    console.log('Type:', typeof employeeId);
    setSelectedEmployeeId(employeeId);
    console.log('Set selectedEmployeeId to:', employeeId);
    setCurrentView('details');
    console.log('Changed view to: details');
  };


  const handleEditEmployee = (employeeId) => {
  setSelectedEmployeeId(employeeId);  // Store the ID
  setCurrentView('edit');              // Switch to edit view
};

  // ✅ Go back to table view
  const handleBackToTable = () => {
    setCurrentView('table');
    setSelectedEmployeeId(null);
    setSelectedEmployee(null);
    loadEmployees(); // Refresh the list
  };

  // ✅ Handle delete
  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await EmployeeMasterAPI.delete(employeeId);
        console.log(response)

        
        if (response?.success) {
          loadEmployees(); // Refresh the list
        } else {
          alert('Failed to delete employee');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Error deleting employee');
      }
    }
  };

  // ✅ Handle update employee
  const handleUpdateEmployee = async (updatedEmployee) => {
    try {
      const response = await EmployeeMasterAPI.update(updatedEmployee);
      console.log(response)
      if (response?.success) {
        loadEmployees();
        setCurrentView('table');
        setSelectedEmployee(null);
      } else {
        alert('Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Error updating employee');
    }
  };

  // ✅ Handle add employee
  const handleAddEmployee = async (newEmployee) => {
    try {
      const response = await EmployeeMasterAPI.add(newEmployee);
      if (response?.success) {
        loadEmployees();
        setShowAddModal(false);
      } else {
        alert('Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Error adding employee');
    }
  };

  // ✅ Handle action from EmployeeTable
  const handleAction = (action, data) => {
    console.log('Action:', action, 'Data:', data);
    if (action === 'view') {
      handleViewEmployee(data);
    } else if (action === 'edit') {
      handleEditEmployee(data);
      console.log(data)
    }
  };

  

  // ✅ Show employee details view
  if (currentView === 'details') {
    console.log('=== RENDERING DETAILS VIEW ===');
    console.log('Passing employeeId:', selectedEmployeeId);
    return (
      <EmployeeDetailsView
        employeeId={selectedEmployeeId}
        onBack={handleBackToTable} 
      />
    );
  }


  //  Show employee edit modal
if (currentView === 'edit') {
  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeModal
        type="edit"
        employeeId={selectedEmployeeId}
        isOpen={true}
        onClose={handleBackToTable}
        onSave={handleUpdateEmployee}
        hideSearch={true}
      />
    </div>
  );
}

  // ✅ Calculate stats
  const probationaryCount = employees.filter(
    emp => emp.employment_details?.is_probation
  ).length;

  const permanentCount = employees.filter(
    emp => !emp.employment_details?.is_probation
  ).length;

  const thisMonthJoiners = employees.filter(emp => {
    const joiningDate = new Date(emp.employment_details?.date_of_joining);
    const now = new Date(); 
    return joiningDate.getMonth() === now.getMonth() && 
           joiningDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Probationary Employees</h1>
          <p className="text-gray-600 mt-1">Manage new Probationary Employees and probation</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              <p className="text-gray-600 text-sm">Total Employees</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{probationaryCount}</p>
              <p className="text-gray-600 text-sm">On Probation</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{permanentCount}</p>
              <p className="text-gray-600 text-sm">Permanent</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{thisMonthJoiners}</p>
              <p className="text-gray-600 text-sm">Joined This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table Component */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
        </div>
      ) : (
        <EmployeeTable
          onViewDetails={handleViewEmployee}
          onAction={handleAction}
          onDelete={handleDeleteEmployee}
        />
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <EmployeeModal
          type="add"
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddEmployee}
        />
      )}
    </div>
  );
};

export default ProbationaryEmployees;









// import React, { useState, useEffect } from 'react';
// import { Users, Search, Filter, Edit, Trash2, Eye, Clock, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
// import { getFromStorage, saveToStorage } from '../../utils/localStorage';
// import { formatDate, isProbationary } from '../../utils/helpers';
// import { EMPLOYEE_STATUS } from '../../utils/constants';
// import EmployeeDetailsPage from './EmployeeDetailsPage';
// import EmployeeModal from './onboarding/EmployeeModal';

// const ProbationaryEmployees = () => {
//   const [employees, setEmployees] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterDepartment, setFilterDepartment] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [currentView, setCurrentView] = useState('table'); // 'table', 'details', 'edit'
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [modalType, setModalType] = useState(null); // 'edit'
//   const employeesPerPage = 10;

//   useEffect(() => {
//     loadEmployees();
//   }, []);

//   const loadEmployees = () => {
//     const employeesData = getFromStorage('employees') || [];
//     // Filter only probationary employees
//     const probationaryEmployees = employeesData.filter(emp => isProbationary(emp));
//     setEmployees(probationaryEmployees);
//   };

//   const departments = [...new Set(employees.map(emp => emp.employmentDetails?.department).filter(Boolean))];

//   const filteredEmployees = employees.filter(employee => {
//     const matchesSearch = !searchTerm || 
//       employee.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       employee.personalDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       employee.employmentDetails?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesDepartment = !filterDepartment || employee.employmentDetails?.department === filterDepartment;

//     return matchesSearch && matchesDepartment;
//   });

//   const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
//   const startIndex = (currentPage - 1) * employeesPerPage;
//   const currentEmployees = filteredEmployees.slice(startIndex, startIndex + employeesPerPage);

//   // Handle view details - switch to details page (same as OnboardingManagement)
//   const handleViewEmployee = (employee) => {
//     setSelectedEmployee(employee);
//     setCurrentView('details');
//   };

//   // Handle edit - switch to edit page (same as OnboardingManagement)
//   const handleEditEmployee = (employee) => {
//     setSelectedEmployee(employee);
//     setCurrentView('edit');
//   };

//   // Go back to table view (same as OnboardingManagement)
//   const handleBackToTable = () => {
//     setCurrentView('table');
//     setSelectedEmployee(null);
//   };

//   const handleStatusChange = (employee, newStatus) => {
//     setSelectedEmployee(employee);
//     setShowStatusModal(true);
//   };

//   const confirmStatusChange = (newStatus) => {
//     if (!selectedEmployee) return;

//     const allEmployees = getFromStorage('employees') || [];
//     const updatedEmployees = allEmployees.map(emp => {
//       if (emp.id === selectedEmployee.id) {
//         return {
//           ...emp,
//           employmentDetails: {
//             ...emp.employmentDetails,
//             employeeStatus: newStatus,
//             statusUpdatedAt: new Date().toISOString()
//           }
//         };
//       }
//       return emp;
//     });

//     saveToStorage('employees', updatedEmployees);
//     loadEmployees();
//     setShowStatusModal(false);
//     setSelectedEmployee(null);
//   };

//   const handleDeleteEmployee = (employeeId) => {
//     if (window.confirm('Are you sure you want to delete this employee?')) {
//       const allEmployees = getFromStorage('employees') || [];
//       const updatedEmployees = allEmployees.filter(emp => emp.id !== employeeId);
//       saveToStorage('employees', updatedEmployees);
//       loadEmployees();
//     }
//   };

//   const handleUpdateEmployee = (updatedEmployee) => {
//     const allEmployees = getFromStorage('employees') || [];
//     const updatedEmployees = allEmployees.map(emp => 
//       emp.id === updatedEmployee.id ? updatedEmployee : emp
//     );
//     saveToStorage('employees', updatedEmployees);
//     loadEmployees();
//     setShowEditModal(false);
//     setSelectedEmployee(null);
//     setModalType(null);
//     // Go back to table after successful update
//     setCurrentView('table');
//   };

//   // Close modal (same as OnboardingManagement)
//   const closeModal = () => {
//     setShowEditModal(false);
//     setModalType(null);
//     setSelectedEmployee(null);
//   };

//   // Show employee details page when currentView is 'details' (same as OnboardingManagement)
//   if (currentView === 'details') {
//     return (
//       <EmployeeDetailsPage
//         employeeId={selectedEmployee.id}
//         onBack={handleBackToTable}
//         onEdit={handleEditEmployee}
//       />
//     );
//   }

//   // Show employee edit page when currentView is 'edit' (same as OnboardingManagement)
//   if (currentView === 'edit') {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <EmployeeModal
//           type="edit"
//           employee={selectedEmployee}
//           isOpen={true}
//           onClose={handleBackToTable}
//           onSave={handleUpdateEmployee}
//         />
//       </div>
//     );
//   }

//   const calculateProbationDays = (joiningDate, probationPeriod) => {
//     if (!joiningDate || !probationPeriod) return 'N/A';
    
//     const joinDate = new Date(joiningDate);
//     const today = new Date();
//     const daysPassed = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));
    
//     // Extract months from probation period (assuming format like "6 months")
//     const months = parseInt(probationPeriod.match(/\d+/)?.[0]) || 6;
//     const totalProbationDays = months * 30; // Approximate
//     const remainingDays = Math.max(0, totalProbationDays - daysPassed);
    
//     return {
//       daysPassed,
//       remainingDays,
//       totalDays: totalProbationDays,
//       isCompleted: remainingDays === 0
//     };
//   };

//   const StatusModal = () => {
//     if (!showStatusModal || !selectedEmployee) return null;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
//         <div className="bg-white rounded-xl p-6 w-full max-w-md">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold">Update Employee Status</h3>
//             <button 
//               onClick={() => setShowStatusModal(false)}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               ×
//             </button>
//           </div>
          
//           <div className="mb-6">
//             <p className="text-gray-600 mb-2">
//               Employee: <span className="font-medium">{selectedEmployee.personalDetails?.fullName}</span>
//             </p>
//             <p className="text-gray-600">
//               Current Status: <span className="font-medium text-amber-600">Probationary</span>
//             </p>
//           </div>

//           <div className="space-y-3">
//             <button
//               onClick={() => confirmStatusChange(EMPLOYEE_STATUS.PERMANENT)}
//               className="w-full p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
//             >
//               <div className="flex items-center">
//                 <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
//                 <div className="text-left">
//                   <div className="font-medium text-green-800">Make Permanent</div>
//                   <div className="text-sm text-green-600">Employee has completed probation successfully</div>
//                 </div>
//               </div>
//             </button>

//             <button
//               onClick={() => handleDeleteEmployee(selectedEmployee.id)}
//               className="w-full p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
//             >
//               <div className="flex items-center">
//                 <Trash2 className="w-5 h-5 text-red-600 mr-3" />
//                 <div className="text-left">
//                   <div className="font-medium text-red-800">Terminate Employment</div>
//                   <div className="text-sm text-red-600">Remove employee from system</div>
//                 </div>
//               </div>
//             </button>
//           </div>

//           <div className="flex justify-end space-x-3 mt-6">
//             <button
//               onClick={() => setShowStatusModal(false)}
//               className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Probationary Employees</h1>
//           <p className="text-gray-600 mt-1">Manage employees in probation period</p>
//         </div>
//         <div className="mt-4 sm:mt-0 flex items-center space-x-2">
//           <div className="bg-amber-100 px-3 py-1 rounded-full">
//             <span className="text-amber-800 text-sm font-medium">
//               {employees.length} on probation
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center">
//             <div className="w-12 h-12 bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl flex items-center justify-center">
//               <Clock className="w-6 h-6 text-white" />
//             </div>
//             <div className="ml-4">
//               <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
//               <p className="text-gray-600 text-sm">Total Probationary</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center">
//             <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
//               <CheckCircle className="w-6 h-6 text-white" />
//             </div>
//             <div className="ml-4">
//               <p className="text-2xl font-bold text-gray-900">
//                 {employees.filter(emp => {
//                   const probationInfo = calculateProbationDays(
//                     emp.employmentDetails?.joiningDate,
//                     emp.employmentDetails?.probationPeriod
//                   );
//                   return probationInfo.isCompleted;
//                 }).length}
//               </p>
//               <p className="text-gray-600 text-sm">Probation Completed</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center">
//             <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
//               <Calendar className="w-6 h-6 text-white" />
//             </div>
//             <div className="ml-4">
//               <p className="text-2xl font-bold text-gray-900">
//                 {employees.filter(emp => {
//                   const probationInfo = calculateProbationDays(
//                     emp.employmentDetails?.joiningDate,
//                     emp.employmentDetails?.probationPeriod
//                   );
//                   return !probationInfo.isCompleted;
//                 }).length}
//               </p>
//               <p className="text-gray-600 text-sm">In Progress</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="flex-1">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search employees..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//               />
//             </div>
//           </div>
//           <select
//             value={filterDepartment}
//             onChange={(e) => setFilterDepartment(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//           >
//             <option value="">All Departments</option>
//             {departments.map(dept => (
//               <option key={dept} value={dept}>{dept}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Employees Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Employee
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Contact
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Department
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Probation Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {currentEmployees.length > 0 ? (
//                 currentEmployees.map((employee) => {
//                   const probationInfo = calculateProbationDays(
//                     employee.employmentDetails?.joiningDate,
//                     employee.employmentDetails?.probationPeriod
//                   );
                  
//                   return (
//                     <tr key={employee.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div>
//                           <div className="text-sm font-medium text-gray-900">
//                             {employee.personalDetails?.fullName || 'N/A'}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {employee.employmentDetails?.designation || 'N/A'}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {employee.personalDetails?.email || 'N/A'}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           {employee.personalDetails?.mobileNumber || 'N/A'}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {employee.employmentDetails?.department || 'N/A'}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm">
//                           {probationInfo !== 'N/A' ? (
//                             <div>
//                               <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                                 probationInfo.isCompleted 
//                                   ? 'bg-green-100 text-green-800' 
//                                   : 'bg-amber-100 text-amber-800'
//                               }`}>
//                                 {probationInfo.isCompleted ? (
//                                   <>
//                                     <CheckCircle className="w-3 h-3 mr-1" />
//                                     Completed
//                                   </>
//                                 ) : (
//                                   <>
//                                     <Clock className="w-3 h-3 mr-1" />
//                                     {probationInfo.remainingDays} days left
//                                   </>
//                                 )}
//                               </div>
//                               <div className="text-xs text-gray-500 mt-1">
//                                 {probationInfo.daysPassed}/{probationInfo.totalDays} days
//                               </div>
//                             </div>
//                           ) : (
//                             <span className="text-gray-500">N/A</span>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center space-x-2">
//                           <button 
//                             onClick={() => handleViewEmployee(employee)}
//                             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                             title="View Employee"
//                           >
//                             <Eye className="w-4 h-4" />
//                           </button>
//                           <button 
//                             onClick={() => handleEditEmployee(employee)}
//                             className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
//                             title="Edit Employee"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </button>
//                           <button 
//                             onClick={() => handleStatusChange(employee)}
//                             className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
//                             title="Update Status"
//                           >
//                             <CheckCircle className="w-4 h-4" />
//                           </button>
//                           <button 
//                             onClick={() => handleDeleteEmployee(employee.id)}
//                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                             title="Delete Employee"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
//                     <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//                     <p className="text-lg font-medium">No probationary employees found</p>
//                     <p className="text-sm">All employees have been confirmed or no data available</p>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
//             <div className="text-sm text-gray-700">
//               Showing {startIndex + 1} to {Math.min(startIndex + employeesPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
//             </div>
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//                 className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//               >
//                 Previous
//               </button>
//               <span className="px-3 py-1 bg-orange-600 text-white rounded-lg">
//                 {currentPage}
//               </span>
//               <button
//                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                 disabled={currentPage === totalPages}
//                 className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       <StatusModal />
//     </div>
//   );
// };

// export default ProbationaryEmployees;