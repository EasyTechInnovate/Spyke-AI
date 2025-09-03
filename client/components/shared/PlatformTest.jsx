// Test component for cross-platform consistency
function PlatformTestComponent() {
    return (
        <div className="p-8 space-y-6 bg-[#0a0a0a]">
            <h2 className="text-2xl font-bold text-white">Platform Test</h2>
            
            {/* Test Border Radius */}
            <div className="p-4 bg-[#1f1f1f] rounded-xl border border-gray-800">
                <p className="text-white">Border radius test - should be consistently rounded</p>
            </div>
            
            {/* Test Gradients */}
            <div className="p-4 bg-gradient-to-r from-[#00FF89] to-blue-500 rounded-lg">
                <p className="text-black font-semibold">Gradient test - colors should be consistent</p>
            </div>
            
            {/* Test Form Elements */}
            <div className="space-y-3">
                <input 
                    type="text" 
                    placeholder="Input test" 
                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                />
                <CustomSelect
                    value=""
                    onChange={() => {}}
                    options={[
                        { value: 'test1', label: 'Test Option 1' },
                        { value: 'test2', label: 'Test Option 2' }
                    ]}
                    placeholder="CustomSelect test"
                />
            </div>
            
            {/* Test Shadows */}
            <div className="p-4 bg-[#1f1f1f] rounded-xl shadow-2xl">
                <p className="text-white">Shadow test - should have consistent depth</p>
            </div>
        </div>
    )
}