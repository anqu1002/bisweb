

function result=all_tests(debug)

    m=mfilename('fullpath');
    [filepath,name,ext] = fileparts(m);
    addpath([ filepath filesep 'tests' ]);

    if nargin<1
        debug=1
    end

    bispath();
    lib=biswrapper();

    result=[ 
        test_combo(debug),
        test_largemem_smooth(debug),
        test_matrix(debug),
        test_resample(debug),
        test_reslice(debug),
        test_smooth(debug)
    ];

    s1=sum(result);
    s2=max(size(result));

    disp('============================================================')
    disp(['=== Test Results (1=pass)=',mat2str(result')]);

     if (s1==s2)
        result=1;
        disp(['=== All ',mat2str(s2),' Tests Passed']);
    else 
        result=0;
        disp(['=== Some ',mat2str(s2-s1),' Tests Failed']);
    end


