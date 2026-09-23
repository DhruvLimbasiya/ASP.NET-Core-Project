-- ================================================================================
-- LEAVE MANAGEMENT SYSTEM - DATABASE RESET & SEED SCRIPT (EXTENSIVE INDIAN DATA)
-- ================================================================================

-- 1. Ensure Table Schema has required columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'ManagerId')
BEGIN
    ALTER TABLE [Users] ADD [ManagerId] INT NULL;
END
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'CompanyName')
BEGIN
    ALTER TABLE [Users] ADD [CompanyName] NVARCHAR(100) NULL;
END
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'TeamName')
BEGIN
    ALTER TABLE [Users] ADD [TeamName] NVARCHAR(100) NULL;
END;

-- 2. Seed System Administrators
IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'aarav.sharma@lms.in')
BEGIN
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (3, N'Aarav', N'Sharma', N'aarav.sharma@lms.in', N'Password123!', 1, N'LMS Corporate', N'Executive Administration', N'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80');
END;

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'priya.nair@lms.in')
BEGIN
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (3, N'Priya', N'Nair', N'priya.nair@lms.in', N'Password123!', 1, N'LMS Corporate', N'System Audit & Security', N'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80');
END;

-- 3. Seed Managers across Companies
IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'rajesh.patel@tcs.in')
BEGIN
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (1, N'Rajesh', N'Patel', N'rajesh.patel@tcs.in', N'Password123!', 1, N'TCS', N'Software Engineering', N'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');
END;

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'sunita.rao@infosys.in')
BEGIN
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (1, N'Sunita', N'Rao', N'sunita.rao@infosys.in', N'Password123!', 1, N'Infosys', N'Cloud Innovations', N'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');
END;

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'rohan.verma@wipro.in')
BEGIN
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (1, N'Rohan', N'Verma', N'rohan.verma@wipro.in', N'Password123!', 1, N'Wipro', N'Data Analytics', N'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');
END;

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'meera.iyer@hcl.in')
BEGIN
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (1, N'Meera', N'Iyer', N'meera.iyer@hcl.in', N'Password123!', 1, N'HCLTech', N'Cybersecurity & DevOps', N'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');
END;

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'vikram.joshi@techm.in')
BEGIN
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (1, N'Vikramaditya', N'Joshi', N'vikram.joshi@techm.in', N'Password123!', 1, N'Tech Mahindra', N'Product Engineering', N'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');
END;

-- Get Manager IDs
DECLARE @RajeshId INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'rajesh.patel@tcs.in');
DECLARE @SunitaId INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'sunita.rao@infosys.in');
DECLARE @RohanId INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'rohan.verma@wipro.in');
DECLARE @MeeraId INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'meera.iyer@hcl.in');
DECLARE @VikramJoshiId INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'vikram.joshi@techm.in');

-- 4. Seed Employees for TCS (Rajesh Patel)
IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'vikram.singh@tcs.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Vikram', N'Singh', N'vikram.singh@tcs.in', N'Password123!', 1, @RajeshId, N'TCS', N'Software Engineering', N'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'sneha.gupta@tcs.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Sneha', N'Gupta', N'sneha.gupta@tcs.in', N'Password123!', 1, @RajeshId, N'TCS', N'Software Engineering', N'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'arjun.mehta@tcs.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Arjun', N'Mehta', N'arjun.mehta@tcs.in', N'Password123!', 1, @RajeshId, N'TCS', N'Software Engineering', N'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'kavya.reddy@tcs.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Kavya', N'Reddy', N'kavya.reddy@tcs.in', N'Password123!', 1, @RajeshId, N'TCS', N'Software Engineering', N'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'siddharth.b@tcs.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Siddharth', N'Banerjee', N'siddharth.b@tcs.in', N'Password123!', 1, @RajeshId, N'TCS', N'Software Engineering', N'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'amit.verma@tcs.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Amit', N'Verma', N'amit.verma@tcs.in', N'Password123!', 0, @RajeshId, N'TCS', N'Software Engineering', N'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'pooja.kulkarni@tcs.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Pooja', N'Kulkarni', N'pooja.kulkarni@tcs.in', N'Password123!', 0, @RajeshId, N'TCS', N'Software Engineering', N'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

-- 5. Seed Employees for Infosys (Sunita Rao)
IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'ananya.deshmukh@infosys.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Ananya', N'Deshmukh', N'ananya.deshmukh@infosys.in', N'Password123!', 1, @SunitaId, N'Infosys', N'Cloud Innovations', N'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'rahul.dravid@infosys.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Rahul', N'Dravid', N'rahul.dravid@infosys.in', N'Password123!', 1, @SunitaId, N'Infosys', N'Cloud Innovations', N'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'divya.agarwal@infosys.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Divya', N'Agarwal', N'divya.agarwal@infosys.in', N'Password123!', 1, @SunitaId, N'Infosys', N'Cloud Innovations', N'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'niharika.sen@infosys.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Niharika', N'Sen', N'niharika.sen@infosys.in', N'Password123!', 0, @SunitaId, N'Infosys', N'Cloud Innovations', N'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'aditya.saxena@infosys.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Aditya', N'Saxena', N'aditya.saxena@infosys.in', N'Password123!', 1, @SunitaId, N'Infosys', N'Cloud Innovations', N'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

-- 6. Seed Employees for Wipro (Rohan Verma)
IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'karthik.s@wipro.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Karthik', N'Subramanian', N'karthik.s@wipro.in', N'Password123!', 1, @RohanId, N'Wipro', N'Data Analytics', N'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'ritu.b@wipro.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Ritu', N'Bhattacharya', N'ritu.b@wipro.in', N'Password123!', 1, @RohanId, N'Wipro', N'Data Analytics', N'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'manisha.kapoor@wipro.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Manisha', N'Kapoor', N'manisha.kapoor@wipro.in', N'Password123!', 1, @RohanId, N'Wipro', N'Data Analytics', N'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'varun.malhotra@wipro.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Varun', N'Malhotra', N'varun.malhotra@wipro.in', N'Password123!', 0, @RohanId, N'Wipro', N'Data Analytics', N'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

-- 7. Seed Employees for HCLTech (Meera Iyer)
IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'deepak.kumar@hcl.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Deepak', N'Kumar', N'deepak.kumar@hcl.in', N'Password123!', 1, @MeeraId, N'HCLTech', N'Cybersecurity & DevOps', N'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'tanvi.trivedi@hcl.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Tanvi', N'Trivedi', N'tanvi.trivedi@hcl.in', N'Password123!', 1, @MeeraId, N'HCLTech', N'Cybersecurity & DevOps', N'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'harsh.vardhan@hcl.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Harsh', N'Vardhan', N'harsh.vardhan@hcl.in', N'Password123!', 1, @MeeraId, N'HCLTech', N'Cybersecurity & DevOps', N'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

-- 8. Seed Employees for Tech Mahindra (Vikramaditya Joshi)
IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'ishaan.c@techm.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Ishaan', N'Choudhury', N'ishaan.c@techm.in', N'Password123!', 1, @VikramJoshiId, N'Tech Mahindra', N'Product Engineering', N'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'trisha.sengupta@techm.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Trisha', N'Sengupta', N'trisha.sengupta@techm.in', N'Password123!', 1, @VikramJoshiId, N'Tech Mahindra', N'Product Engineering', N'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'neha.pillai@techm.in')
    INSERT INTO [Users] ([RoleId], [FirstName], [LastName], [Email], [Password], [IsActive], [ManagerId], [CompanyName], [TeamName], [ProfilePicturePath])
    VALUES (2, N'Neha', N'Pillai', N'neha.pillai@techm.in', N'Password123!', 0, @VikramJoshiId, N'Tech Mahindra', N'Product Engineering', N'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

-- 9. Seed Leave Balances for active users
INSERT INTO [LeaveBalances] ([UserId], [LeaveTypeId], [CalendarYearId], [AllocatedDays], [UsedDays])
SELECT u.[UserId], lt.[LeaveTypeId], 1, 
       CASE WHEN lt.[TypeName] LIKE '%Annual%' THEN 20 WHEN lt.[TypeName] LIKE '%Sick%' THEN 10 ELSE 12 END, 
       0
FROM [Users] u
CROSS JOIN [LeaveTypes] lt
WHERE u.[IsActive] = 1
  AND NOT EXISTS (
      SELECT 1 FROM [LeaveBalances] lb 
      WHERE lb.[UserId] = u.[UserId] AND lb.[LeaveTypeId] = lt.[LeaveTypeId]
  );

-- 10. Seed Sample Indian Leave Requests
DECLARE @AnnualTypeId INT = (SELECT TOP 1 [LeaveTypeId] FROM [LeaveTypes] WHERE [TypeName] LIKE '%Annual%');
DECLARE @SickTypeId INT = (SELECT TOP 1 [LeaveTypeId] FROM [LeaveTypes] WHERE [TypeName] LIKE '%Sick%');
DECLARE @CasualTypeId INT = (SELECT TOP 1 [LeaveTypeId] FROM [LeaveTypes] WHERE [TypeName] LIKE '%Casual%');

IF @AnnualTypeId IS NULL SET @AnnualTypeId = 1;
IF @SickTypeId IS NULL SET @SickTypeId = 2;
IF @CasualTypeId IS NULL SET @CasualTypeId = 3;

DECLARE @U_VikramSingh INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'vikram.singh@tcs.in');
DECLARE @U_SnehaGupta INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'sneha.gupta@tcs.in');
DECLARE @U_ArjunMehta INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'arjun.mehta@tcs.in');
DECLARE @U_KavyaReddy INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'kavya.reddy@tcs.in');
DECLARE @U_AnanyaDeshmukh INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'ananya.deshmukh@infosys.in');
DECLARE @U_RahulDravid INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'rahul.dravid@infosys.in');
DECLARE @U_DivyaAgarwal INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'divya.agarwal@infosys.in');
DECLARE @U_KarthikSubramanian INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'karthik.s@wipro.in');
DECLARE @U_RituBhattacharya INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'ritu.b@wipro.in');
DECLARE @U_DeepakKumar INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'deepak.kumar@hcl.in');
DECLARE @U_TanviTrivedi INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'tanvi.trivedi@hcl.in');
DECLARE @U_IshaanChoudhury INT = (SELECT TOP 1 [UserId] FROM [Users] WHERE [Email] = N'ishaan.c@techm.in');

IF NOT EXISTS (SELECT 1 FROM [LeaveRequests] WHERE [Reason] LIKE '%Diwali%')
BEGIN
    INSERT INTO [LeaveRequests] ([UserId], [LeaveTypeId], [StartDate], [EndDate], [TotalDays], [StatusId], [Reason])
    VALUES 
    (@U_VikramSingh, @AnnualTypeId, '2026-10-20', '2026-10-25', 6, 1, N'Attending Diwali festival celebrations with family in Jaipur'),
    (@U_SnehaGupta, @CasualTypeId, '2026-11-02', '2026-11-04', 3, 1, N'Personal work & family visit in Lucknow'),
    (@U_ArjunMehta, @SickTypeId, '2026-09-15', '2026-09-17', 3, 2, N'High fever and viral recovery advised by doctor'),
    (@U_KavyaReddy, @AnnualTypeId, '2026-12-24', '2026-12-31', 8, 2, N'Year-end vacation trip to Goa'),
    (@U_AnanyaDeshmukh, @SickTypeId, '2026-09-10', '2026-09-12', 3, 2, N'Medical checkup and recovery at Apollo Hospital'),
    (@U_RahulDravid, @CasualTypeId, '2026-10-12', '2026-10-14', 3, 1, N'Attending family function in Bengaluru'),
    (@U_DivyaAgarwal, @AnnualTypeId, '2026-11-10', '2026-11-15', 6, 3, N'Personal trip to Shimla and Manali'),
    (@U_KarthikSubramanian, @AnnualTypeId, '2026-10-18', '2026-10-24', 7, 2, N'Durga Puja celebrations with family in Kolkata'),
    (@U_RituBhattacharya, @CasualTypeId, '2026-09-28', '2026-09-29', 2, 1, N'Home shifting and personal errands in Hyderabad'),
    (@U_DeepakKumar, @SickTypeId, '2026-09-01', '2026-09-03', 3, 2, N'Emergency dental procedure and recovery'),
    (@U_TanviTrivedi, @AnnualTypeId, '2026-11-20', '2026-11-25', 6, 1, N'Attending sibling wedding in Ahmedabad'),
    (@U_IshaanChoudhury, @CasualTypeId, '2026-10-05', '2026-10-06', 2, 2, N'Ganesh Chaturthi festival celebrations in Pune');
END;
